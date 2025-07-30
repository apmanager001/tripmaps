const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../model/user");

// Create a checkout session for subscription
const createCheckoutSession = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Monthly subscription price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/dashboard/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: userId,
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
    });
  }
};

// Handle webhook events from Stripe
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case "customer.subscription.created":
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// Handle successful checkout session
const handleCheckoutSessionCompleted = async (session) => {
  const userId = session.metadata.userId;

  if (userId) {
    await User.findByIdAndUpdate(userId, {
      stripeCustomerId: session.customer,
      subscriptionStatus: "active",
      subscriptionId: session.subscription,
    });
  }
};

// Handle subscription creation
const handleSubscriptionCreated = async (subscription) => {
  const customerId = subscription.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: subscription.status,
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }
};

// Handle subscription updates
const handleSubscriptionUpdated = async (subscription) => {
  const customerId = subscription.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (subscription) => {
  const customerId = subscription.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: "canceled",
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (invoice) => {
  const customerId = invoice.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: "active",
      lastPaymentDate: new Date(),
    });
  }
};

// Handle failed payment
const handlePaymentFailed = async (invoice) => {
  const customerId = invoice.customer;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: "past_due",
    });
  }
};

// Get subscription status for a user
const getSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionStatus: user.subscriptionStatus || "inactive",
        currentPeriodEnd: user.currentPeriodEnd,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get subscription status",
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: subscription.status,
    });

    res.json({
      success: true,
      message: "Subscription will be canceled at the end of the current period",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
};
