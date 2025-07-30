# Stripe Integration Setup Guide

## Overview

This guide will help you set up Stripe for the monthly subscription feature ($1.99/month) in your TripMaps application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard

## Step 1: Get Your Stripe Keys

### 1.1 Secret Key

1. Go to your Stripe Dashboard
2. Navigate to **Developers** > **API keys**
3. Copy your **Secret key** (starts with `sk_test_` for test mode, `sk_live_` for live mode)

### 1.2 Publishable Key

1. In the same API keys section
2. Copy your **Publishable key** (starts with `pk_test_` for test mode, `pk_live_` for live mode)

## Step 2: Create a Product and Price

### 2.1 Create Product

1. Go to **Products** in your Stripe Dashboard
2. Click **Add product**
3. Set the following:
   - **Name**: TripMaps Premium
   - **Description**: Monthly subscription for TripMaps Premium features
   - **Images**: (Optional) Add your app logo

### 2.2 Create Price

1. In the product page, click **Add price**
2. Set the following:
   - **Pricing model**: Standard pricing
   - **Price**: $1.99
   - **Billing period**: Monthly
   - **Currency**: USD
3. Click **Save price**
4. Copy the **Price ID** (starts with `price_`)

## Step 3: Set Up Webhooks

### 3.1 Create Webhook Endpoint

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the following:
   - **Endpoint URL**: `https://your-domain.com/stripe/webhook`
   - **Events to send**: Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 3.2 Get Webhook Secret

1. After creating the webhook, click on it
2. Go to **Signing secret**
3. Click **Reveal** and copy the secret (starts with `whsec_`)

## Step 4: Environment Variables

Add these variables to your backend `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:3000
```

## Step 5: Test the Integration

### 5.1 Test Mode

1. Use test card numbers from Stripe:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

### 5.2 Test Flow

1. Start your backend server
2. Go to your app's settings page
3. Click "Upgrade Now"
4. Complete the Stripe checkout with test card
5. Verify subscription status updates in your app

## Step 6: Go Live

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Update environment variables with live keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_live_`)
   - `STRIPE_PRICE_ID` (create new live price)
   - `STRIPE_WEBHOOK_SECRET` (create new live webhook)
3. Update `FRONTEND_URL` to your production domain

## Features Implemented

### Backend

- ✅ Stripe checkout session creation
- ✅ Webhook handling for subscription events
- ✅ User subscription status tracking
- ✅ Subscription cancellation
- ✅ Payment success/failure handling

### Frontend

- ✅ Upgrade button in settings
- ✅ Subscription status display
- ✅ Loading states and error handling
- ✅ Redirect to Stripe checkout
- ✅ Different UI for active vs inactive subscriptions

### Database

- ✅ User model updated with subscription fields:
  - `stripeCustomerId`
  - `subscriptionId`
  - `subscriptionStatus`
  - `currentPeriodEnd`
  - `lastPaymentDate`

## Next Steps

1. **Implement Ad Removal**: Add logic to hide ads for premium users
2. **Add Premium Features**: Implement feature gates based on subscription status
3. **Subscription Management**: Add customer portal for subscription management
4. **Analytics**: Track subscription metrics and revenue
5. **Email Notifications**: Send welcome and renewal emails

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**

   - Check webhook endpoint URL is accessible
   - Verify webhook secret is correct
   - Check server logs for errors

2. **Checkout session creation fails**

   - Verify Stripe secret key is correct
   - Check price ID exists and is active
   - Ensure user ID is valid

3. **Subscription status not updating**
   - Check webhook events are being received
   - Verify database connection
   - Check user model has subscription fields

### Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
