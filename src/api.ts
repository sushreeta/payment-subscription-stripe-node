import express, { NextFunction, Request, Response } from "express";
export const app = express();
import {
  createSubscription,
  listSubscription,
  cancelSubscription,
  cancelSubscriptionAtPeriodEnd,
  prorationSubscription,
  prorationConfirmSubscription,
} from "./billing";
import { createPaymentIntent } from "./payment";
import { createStripeCheckoutSEssion } from "./checkout";
import { getOrCreateCustomer } from "./customer";

app.use(express.json());

// allow cross origin requests
import cors from "cors";
import { handleStripeWebhook } from "./webhooks";
import { createSetupIntent, listPaymentMethods } from "./customer";
app.use(cors({ origin: true }));

// sets rawBody for webhook handling
app.use(
  express.json({
    verify: (req, res, buffer) => (req["rawBody"] = buffer),
  })
);

// catch async errors when awaiting promises
const runAsync: Function = (callback: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  };
};

// validate if user exist on the request [NOT USED PROPERLY FOR NOW, CAN BE USED AFTER AUTH IMPLEMENTATION]
function validateUser(req: Request) {
  const user = req["currentUser"];
  if (!user) {
    throw new Error(
      "You must be logged in to make this request. i.e Authroization: Bearer <token>"
    );
  }
  return user;
}

/*****************************
 * API *
 ******************************/

// Check server health
app.get("/test", (req: Request, res: Response) => {
  res.status(200).send("API is up and running fine");
});

// Checkout payment
app.post(
  "/checkout",
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createStripeCheckoutSEssion(body.line_items));
  })
);

// PaymentIntent
app.post(
  "/payments",
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createPaymentIntent(body.amount));
  })
);

// Billing & recurring payment (subscription)
app.post(
  "/subscription",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId, plan, payment_method } = req.body;
    const subscription = await createSubscription(userId, plan, payment_method);
    res.send(subscription);
  })
);

// Show list of subscription
app.get(
  "/subscription",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId } = req.body;
    const subscription = await listSubscription(userId);
    res.send(subscription.data);
  })
);

// Cancel subscription immediately
app.patch(
  "/subscription/cancel/:id",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId } = req.body;
    const subscription = await cancelSubscription(userId, req.params.id);
    res.send(subscription);
  })
);

// Cancel at period end subscription
app.patch(
  "/subscription/cancel/periodend/:id",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId } = req.body;
    const subscription = await cancelSubscriptionAtPeriodEnd(
      userId,
      req.params.id
    );
    res.send(subscription);
  })
);

// Ask confirmation for prorate of subscription (upgrade or downgrade of subscription)
app.post(
  "/subscription/prorate/:id",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { plan, userId } = req.body;
    const subscription = await prorationSubscription(
      req.params.id,
      plan,
      userId
    );
    res.send(subscription);
  })
);

// Final proration of subscription (upgrade or downgrade of subscription)
app.patch(
  "/subscription/prorate/confirm/:id",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { plan } = req.body;
    const subscription = await prorationConfirmSubscription(
      req.params.id,
      plan
    );
    res.send(subscription);
  })
);

// Create customer
app.post(
  "/customer",
  runAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const subscription = await getOrCreateCustomer(email);
    res.send(subscription);
  })
);

// Hook
app.post("/hooks", runAsync(handleStripeWebhook));

// Save a card to a customer
app.post(
  "/wallet",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    const { userId } = req.body;
    const setupIntent = await createSetupIntent(userId);
    res.send(setupIntent);
  })
);

// Retrive all cards attached to a customer
app.get(
  "/wallet/:id",
  runAsync(async (req: Request, res: Response) => {
    // const user = validateUser(req);
    // user.uid
    const wallet = await listPaymentMethods(req.params.id);
    res.send(wallet.data);
  })
);
