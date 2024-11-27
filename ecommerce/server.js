const express = require("express");
const knex = require("knex");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { authenticate } = require("./authorization/authMiddleware.js");
const stripe = require("stripe")("sk_test_51Nf3pGJ6VhgbPvzwGQrIl6rup1lZRdWBAlDR8gXkVH4fMb70J3Z4TtJOXLNepyzX83Dw4IXsg9Jm1wGa4I7eA2kl00AJuQ7mF7");

dotenv.config();

const knexConfig = require("./knexfile.js")[process.env.NODE_ENV || "development"];
const db = knex(knexConfig);
const jwt = require("jsonwebtoken");

const app = express();


app.use(cors());
app.use(express.json());
app.use("/webhook", bodyParser.raw({ type: "application/json" })); 

// Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// --- NEW CART ENDPOINT ---
app.get("/cart", authenticate, async (req, res) => {
  try {
    console.log("Fetching cart for user ID:", req.userId);

    const cartItems = await db("cart")
      .where({ user_id: req.userId })
      .select("product_id as productId", "price", "quantity");

    if (cartItems.length === 0) {
      console.warn(`No cart items found for user ID: ${req.userId}`);
      return res.status(404).json({ cart: [] });
    }

    console.log("Cart retrieved:", cartItems);
    res.status(200).json({ cart: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

// Other routes...

// Example: Add a product to the cart
app.post("/cart", authenticate, async (req, res) => {
  const { productId, price, quantity } = req.body;

  if (!productId || !price || !quantity) {
    return res.status(400).json({ error: "Product ID, price, and quantity are required" });
  }

  try {
    const existingItem = await db("cart")
      .where({ user_id: req.userId, product_id: productId })
      .first();

    if (existingItem) {
      await db("cart")
        .where({ user_id: req.userId, product_id: productId })
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date(),
        });
      console.log(`Updated quantity for product ID: ${productId}`);
    } else {
      await db("cart").insert({
        user_id: req.userId,
        product_id: productId,
        price,
        quantity,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log(`Added new product to cart for user ID: ${req.userId}`);
    }

    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    res.status(500).json({ error: "Failed to add product to cart" });
  }
});

// Clear cart
app.delete("/cart", authenticate, async (req, res) => {
  try {
    await db("cart").where({ user_id: req.userId }).del();
    console.log(`Cleared cart for user ID: ${req.userId}`);
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Get users
app.get("/users", async (req, res) => {
  try {
    const users = await db("users").select("id", "username", "email", "password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.get("/user/address", authenticate, async (req, res) => {
  console.log("Middleware passed. User ID:", req.userId); 
  try {
    const address = await db("addresses").where({ user_id: req.userId }).first();
    console.log("Address Retrieved:", address); 
    if (!address) {
      console.error("No address found for User ID:", req.userId);
      return res.status(404).json({ error: "No address found." });
    }
    res.json(address);
  } catch (error) {
    console.error("Error fetching address:", error.message);
    res.status(500).json({ error: "Failed to fetch address." });
  }
});

app.put("/user/address", authenticate, async (req, res) => {
  const { street, city, state, zip, country } = req.body;

  if (!street || !city || !state || !zip || !country) {
    return res.status(400).json({ error: "All address fields are required." });
  }

  try {
    const existingAddress = await db("addresses").where({ user_id: req.userId }).first();

    if (existingAddress) {
      await db("addresses")
        .where({ user_id: req.userId })
        .update({ street, city, state, zip, country });
      console.log("Updated existing address for user ID:", req.userId);
    } else {
      await db("addresses").insert({
        user_id: req.userId,
        street,
        city,
        state,
        zip,
        country,
      });
      console.log("Added new address for user ID:", req.userId);
    }

    res.status(200).json({ message: "Address saved successfully." });
  } catch (error) {
    console.error("Error saving address:", error.message);
    res.status(500).json({ error: "Failed to save address." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Failed to log in." });
  }
});

// Register route
app.post("/register", async (req, res) => {
  const { username, email, password, name, address } = req.body;

  try {
    const existingUser = await db("users").where({ email }).orWhere({ username }).first();
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userId] = await db("users").insert({ username, email, password: hashedPassword, name });

    if (address) {
      await db("addresses").insert({
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      });
    }

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// Account route
app.get("/account", authenticate, async (req, res) => {
  try {
    const user = await db("users").where({ id: req.userId }).select("username", "email", "name").first();

    const address = await db("addresses")
      .where({ user_id: req.userId })
      .select("street", "city", "state", "zip", "country")
      .first();

      const orders = await db("orders")
      .where({ user_id: req.userId })
      .select("id", "total_price as total");

    if (user) {
      res.status(200).json({
        user: {
          ...user,
          address: address
            ? {
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country,
              }
            : null,
        },
        orders,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Failed to fetch account data:", error.message);
    res.status(500).json({ error: "Failed to fetch account data." });
  }
});

// Categories route
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await db("categories").select("*");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
});

// Products route
app.get("/api/products", async (req, res) => {
  const { categoryId } = req.query;
  try {
    const products = categoryId
      ? await db("products").where({ category_id: categoryId }).select("*")
      : await db("products").select("*");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products" });
  }
});

// Single product route
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await db("products").where({ id }).first();
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: `Product with ID ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve product" });
  }
});

// Orders route
app.post("/api/orders", authenticate, async (req, res) => {
  const { items } = req.body;

  try {
    // Fetch product prices from the database dynamically
    const productIds = items.map((item) => item.productId);
    const products = await db("products")
      .whereIn("id", productIds)
      .select("id", "price");

    // Map product IDs to their prices
    const productPriceMap = products.reduce((acc, product) => {
      acc[product.id] = product.price;
      return acc;
    }, {});

    // Calculate total price dynamically
    const totalPrice = items.reduce((total, item) => {
      const productPrice = productPriceMap[item.productId];
      return total + productPrice * item.quantity;
    }, 0);

    // Insert new order
    const [orderId] = await db("orders").insert({
      user_id: req.userId,
      status: "Processing",
      total_price: totalPrice,
    });

    // Create order_items using dynamic product prices
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      price: productPriceMap[item.productId], // Dynamically fetched price
      quantity: item.quantity,
    }));

    await db("order_items").insert(orderItems);

    res.status(201).json({ orderId, status: "Processing", items: orderItems });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Stripe Payment Intent
app.post("/create-payment-intent", authenticate, async (req, res) => {
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
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
  const endpointSecret = "whsec_4ca11e911f9f9ec20aca42fa3d30f6456d5bc9c201e3541e450606d9cbbf79e0";
  
  app.post(
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
