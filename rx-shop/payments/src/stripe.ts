// the entire purpose of this file is to really just create an 
// instance of this library and then export it so it can be 
// used in other locations inside of our project

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: '2022-08-01'
});