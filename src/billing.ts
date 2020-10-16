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
  await stripe.paymentMethods.attach(payment_method, {
    customer: userId /*customer.id*/,
  });

  // set it as the default payment method
  await stripe.customers.update(userId /*customer.id*/, {
    invoice_settings: { default_payment_method: payment_method },
  });

  const subscription = await stripe.subscriptions.create({
    customer: userId /*customer.id*/,
    items: [{ plan }],
    expand: ["latest_invoice.payment_intent"],
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

  // update the user's status in your db
  if (payment_intent.status === "succeeded") {
    //do something
  }
  return subscription;
};

//cancel an active subscription
export const cancelSubscription = async (
  userId: string,
  subscriptionId: string
) => {
  //cancel the subscription immediately
  const subscription = await stripe.subscriptions.del(subscriptionId);

  if (subscription.status == "canceled") {
    //update in db(remove the subscription plan)
  }

  return subscription;
};
export const cancelSubscriptionAtPeriodEnd = async (
  userId: string,
  subscriptionId: string
) => {
  // canceled at the end of the current period
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  if (subscription.status == "canceled") {
    //update in db(remove the subscription plan)
  }

  return subscription;
};

export const listSubscription = async (userId: string) => {
  // const customer = await getOrCreateCustomer(userId);
  const subscriptions = await stripe.subscriptions.list({
    customer: userId, //customer.id,
  });
  return subscriptions;
};

export const prorationSubscription = async (
  subId: string,
  newPlan: string,
  userId: string
) => {
  const subscription = await stripe.subscriptions.retrieve(subId);

  // Set proration date to this moment:
  const proration_date = Math.floor(Date.now() / 1000);

  const items = [
    {
      id: subscription.items.data[0].id,
      price: newPlan, // Switch to new price
    },
  ];

  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: userId,
    subscription: subId,
    subscription_items: items,
    subscription_proration_date: proration_date,
  });

  return invoice;
};

export const prorationConfirmSubscription = async (
  subId: string,
  newPlan: string
) => {
  const subscription = await stripe.subscriptions.retrieve(subId);
  // Set proration date to this moment:
  const proration_date = Math.floor(Date.now() / 1000);

  stripe.subscriptions.update(subId, {
    cancel_at_period_end: false,
    proration_behavior: "create_prorations",
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPlan,
      },
    ],
    proration_date: proration_date,
  });

  return { success: true };
};
