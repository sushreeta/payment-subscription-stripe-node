//Environment variable, stripe API key
import { config } from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  config();
}

//initialize stripe
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
})

import { app } from './api';
const port = process.env.PORT || 3030;
app.listen(port, ()=>{ console.log(`listening on port ${port}`)})
