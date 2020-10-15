import { stripe } from "./";

//create a payment intent with a specific amount
export async function createPaymentIntent(amount: number) {

  const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      // receipt_email: 'sushreeta04@gmail.com',
    });

    return paymentIntent;
}