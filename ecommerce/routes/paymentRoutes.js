const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require("./authMiddleware");
const db = require("../dbSetup");
const router = express.Router();
const bodyParser = require("body-parser");


// Orders route
router.post("/api/orders", authenticate, async (req, res) => {
    const { items } = req.body;
  
    try {
      const productIds = items.map((item) => item.productId);
      const products = await db("products")
        .whereIn("id", productIds)
        .select("id", "price");
  
      const productPriceMap = products.reduce((acc, product) => {
        acc[product.id] = product.price;
        return acc;
      }, {});
  
      const totalPrice = items.reduce((total, item) => {
        const productPrice = productPriceMap[item.productId];
        return total + productPrice * item.quantity;
      }, 0);
  
      const [orderId] = await db("orders").insert({
        user_id: req.userId,
        status: "Processing",
        total_price: totalPrice,
      });
  
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        price: productPriceMap[item.productId], 
        quantity: item.quantity,
      }));
  
      await db("order_items").insert(orderItems);
  
      res.status(201).json({ orderId, status: "Processing", items: orderItems });
    } catch (error) {
      console.error("Error creating order:", error.message);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

// CREATE PAYMENT INTENT
router.post("/create-payment-intent", authenticate, async (req, res) => {
  const { amount, shippingAddress, products } = req.body;

  if (!amount || !shippingAddress || !products || products.length === 0) {
    console.log("Validation failed: Missing required fields");
    return res.status(400).json({ error: "Amount, shipping address, and products are required." });
  }

  console.log("Request Body:", req.body);

  try {
    if (shippingAddress.name) {
      await db("users")
        .where({ id: req.userId })
        .update({ name: shippingAddress.name });
      console.log(`Updated user name for user ID ${req.userId}: ${shippingAddress.name}`);
    }

    const existingAddress = await db("addresses").where({ user_id: req.userId }).first();

    if (existingAddress) {
      await db("addresses")
        .where({ user_id: req.userId })
        .update({
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        });
      console.log("Updated existing address for user ID:", req.userId);
    } else {
      await db("addresses").insert({
        user_id: req.userId,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
      });
      console.log("Inserted new address for user ID:", req.userId);
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    console.log("Current Date:", currentDate);

    const insertOrderQuery = await db("orders").insert({
      user_id: req.userId,
      status: "pending",
      total_price: (amount / 100).toFixed(2),
      order_date: currentDate,
    });
    const orderId = insertOrderQuery[0];
    console.log("Order Created with ID:", orderId);

    const orderItems = products.map((product) => ({
      order_id: orderId,
      product_id: product.productId,
      price: product.price,
      quantity: product.quantity,
      created_at: currentDate,
      updated_at: currentDate,
    }));

    await db("order_items").insert(orderItems);
    console.log("Order Items Inserted:", orderItems);

    const amountInCents = Math.round(amount);
    console.log("Amount converted to cents:", amountInCents);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { orderId: orderId.toString() },
    });

    console.log("Stripe Payment Intent Created:", paymentIntent);

    console.log("Response Sent:", { clientSecret: paymentIntent.client_secret, orderId });
    res.status(200).json({ clientSecret: paymentIntent.client_secret, orderId });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).json({ error: "Failed to create payment intent." });
  }
});

// Stripe Webhook
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }), 
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("Webhook Event Received:", event.type);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment Succeeded for Intent:", paymentIntent.id);

        db("orders")
          .where({ id: paymentIntent.metadata.orderId })
          .update({ status: "completed", updated_at: new Date() })
          .then(() => console.log("Order marked as completed for Order ID:", paymentIntent.metadata.orderId))
          .catch((error) => console.error("Error updating order status:", error.message));
        break;

      case "payment_intent.payment_failed":
        console.log("Payment Failed for Intent:", event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send();
  }
);

module.exports = router;