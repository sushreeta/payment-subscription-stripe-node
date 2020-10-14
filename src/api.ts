import express, { NextFunction, Request, Response } from "express";
export const app = express();

import { createStripeCheckoutSEssion } from "./checkout";

app.use(express.json());

import cors from "cors";
app.use(cors({ origin: true }));

// check server health
app.get("/test", (req: Request, res: Response) => {
  res.status(200).send("API is up and running fine");
})

// catch async errors when awaiting promises
const runAsync: Function = (callback: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  }
}

// checkout
app.post("/checkout", runAsync( async ({ body }: Request, res: Response) => {
  res.send(
    await createStripeCheckoutSEssion(body.line_items)
  );
}))
