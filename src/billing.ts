import Stripe from "stripe";
import { stripe } from ".";
// import { getOrCreateCustomer } from "./customer";

export const createSubscription = async (
  userId: string,
  plan: string,
  payment_method: string
) => {
  // retrive customer
  // const customer = await getOrCreateCustomer(userId);

  //attach the payment method to the customer
  await stripe.paymentMethods.attach(payment_method, { customer: userId /*customer.id*/ });

  // set it as the default payment method 
  await stripe.customers.update(userId /*customer.id*/, {
    invoice_settings: { default_payment_method: payment_method },
  });

  const subscription = await stripe.subscriptions.create({
    customer: userId /*customer.id*/,
    items: [{ plan }],
    expand: ['latest_invoice.payment_intent'],
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

  // update the user's status in your db
  if (payment_intent.status === 'succeeded') {
  //   await db
  //     .collection('users')
  //     .doc(userId)
  //     .set({
  //       stripeCustomerId: customer.id,
  //       // activePlans: firestore.FieldValue.arrayUnion(plan),
  //     },
  //     { merge: true } //delete if any existing data in the document
  //     );
  }
  return subscription;
}

//cancel an active subscription
export const cancelSubscription = async (
  userId: string,
  subscriptionId: string,
) => {
  const subscription = await stripe.subscriptions.del(subscriptionId); //this immidiately cancel the subscription

  // cancel at end of period
  // const subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

  if (subscription.status == "canceled") {
    //update in db(remove the subscription plan)
  }
  
  return subscription;
}

export const listSubscription = async (userId: string) => {
  // const customer = await getOrCreateCustomer(userId);
  const subscriptions = await stripe.subscriptions.list({
    customer: userId, //customer.id,
  })

  return subscriptions;

}