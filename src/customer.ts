import { stripe } from "./";
// import Stripe from "stripe";

// retrive customer if exist or create a new customer in stripe
export const getOrCreateCustomer = async (email: string) => {
  // const userSnapshot = await //get user from db

  // const { stripeCustomerId, email } = userSnapshot.data(); //retrive stripe customer id

  // If missing customerId. create it
  // if (!stripeCustomerId) {
  const customer = await stripe.customers.create({
    email,
    // metadata: {
    //   firebaseUID: userId
    // },
    // ...params
  });
  // await userSnapshot.ref.update({ stripeCustomerId: customer.id})
  return customer;
  // } else {
  // return await stripe.customers.retrieve(stripeCustomerId);
  // }
};

// save credit card for later use
export const createSetupIntent = async (userId: string) => {
  // const customer = await getOrCreateCustomer(userId);
  return stripe.setupIntents.create({
    customer: userId,
  });
};

// all payment sources associated to the user
export const listPaymentMethods = async (userId: string) => {
  // const customer = await getOrCreateCustomer(userId);

  return stripe.paymentMethods.list({
    customer: userId,
    type: "card",
  });
};
