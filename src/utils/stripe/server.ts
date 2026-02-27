import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
    appInfo: {
        name: 'De la Finca MVP',
        version: '1.0.0',
    },
});
