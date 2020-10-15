import express, { NextFunction, Request, Response } from "express";
export const app = express();
import { createSubscription, listSubscription, cancelSubscription } from "./billing";
import { createPaymentIntent } from "./payment";
import { createStripeCheckoutSEssion } from "./checkout";
import { getOrCreateCustomer } from "./customer";

app.use(express.json());

//allow cross origin requests
import cors from "cors";
import { handleStripeWebhook } from "./webhooks";
import { createSetupIntent, listPaymentMethods } from "./customer";
app.use(cors({ origin: true }));

//sets rawBody for webhook handling
app.use(express.json({
  verify: (req, res, buffer) => (req["rawBody"] = buffer),

}));

// catch async errors when awaiting promises
const runAsync: Function = (callback: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  }
}

// validate if user exist on the request
function validateUser(req: Request) {
  const user = req['currentUser'];
  if (!user) {
    throw new Error(
      'You must be logged in to make this request. i.e Authroization: Bearer <token>'
    );
  }

  return user;
}

/*****************************
 * API *
******************************/

// check server health
app.get("/test", (req: Request, res: Response) => {
  res.status(200).send("API is up and running fine");
})

// checkout
app.post("/checkout", runAsync( async ({ body }: Request, res: Response) => {
  res.send(
    await createStripeCheckoutSEssion(body.line_items)
  );
}))

// paymentIntent
app.post("/payments", runAsync(async ({ body }: Request, res: Response) => {
  res.send(await createPaymentIntent(body.amount));
}));

// billing & recurring subscriptions
app.post(
  '/subscription',
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId, plan, payment_method } = req.body;
    const subscription = await createSubscription(userId, plan, payment_method);
    res.send(subscription);
  })
);

//list subscription
app.get(
  '/subscription',
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId } = req.body;
    const subscription = await listSubscription(userId);
    res.send(subscription.data);
  })
);

//update subscription
app.patch(
  '/subscription/:id',
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId } = req.body;
    const subscription = await cancelSubscription(userId, req.params.id);
    res.send(subscription);
  })
);

//create customer
app.post(
  '/customer',
  runAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const subscription = await getOrCreateCustomer(email);
    res.send(subscription);
  })
);

// hook
app.post("/hooks", runAsync(handleStripeWebhook));

//save a card to a customer
app.post("/wallet", runAsync(async (req: Request, res: Response) => {
  const user = validateUser(req);
  const setupIntent = await createSetupIntent(user.uid);
  res.send(setupIntent);
}))

// retrive all cards attached to a customer
app.get("/wallet", runAsync(async (req: Request, res: Response) => {
  const user = validateUser(req);

  const wallet = await listPaymentMethods(user.uid);
  res.send(wallet.data);
}))