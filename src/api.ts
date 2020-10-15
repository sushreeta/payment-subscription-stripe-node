import express, { NextFunction, Request, Response } from "express";
export const app = express();

import { createPaymentIntent } from "./payment";
import { createStripeCheckoutSEssion } from "./checkout";

app.use(express.json());

//allow cross origin requests
import cors from "cors";
import { handleStripeWebhook } from "./webhooks";
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

// hook
app.post("/hooks", runAsync(handleStripeWebhook));
