/* const express = require("express");
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
app.use("/webhook", bodyParser.raw({ type: "application/json" })); // Required for Stripe webhook

// Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
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
  const { username, email, password, address } = req.body;

  try {
    const existingUser = await db("users").where({ email }).orWhere({ username }).first();
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userId] = await db("users").insert({ username, email, password: hashedPassword });

    if (address) {
      await db("addresses").insert({
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.postal_code,
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
    const user = await db("users").where({ id: req.userId }).select("username", "email").first();

    const address = await db("addresses")
      .where({ user_id: req.userId })
      .select("street", "city", "state", "zip", "country")
      .first();

    const orders = await db("orders")
      .where({ user_id: req.userId })
      .select("id", "total as total");

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
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const [orderId] = await db("orders").insert({
      user_id: req.userId,
      status: "Processing",
      total: totalPrice,
    });

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
    }));

    await db("order_items").insert(orderItems);

    res.status(201).json({ orderId, status: "Processing", items });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Stripe Payment Intent
app.post("/create-payment-intent", authenticate, async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    await db("orders").insert({
      user_id: req.userId,
      status: "pending",
      total: amount / 100, // Convert to dollars
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook
const endpointSecret = "whsec_4ca11e911f9f9ec20aca42fa3d30f6456d5bc9c201e3541e450606d9cbbf79e0";

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      try {
        await db("orders")
          .where({ total: paymentIntent.amount / 100 })
          .update({ status: "completed" });
        console.log("Payment succeeded and order updated.");
      } catch (error) {
        console.error("Failed to update order:", error.message);
      }
      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send();
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); */
 

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
app.use("/webhook", bodyParser.raw({ type: "application/json" })); // Required for Stripe webhook

// Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
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
  const { username, email, password, address } = req.body;

  try {
    const existingUser = await db("users").where({ email }).orWhere({ username }).first();
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userId] = await db("users").insert({ username, email, password: hashedPassword });

    if (address) {
      await db("addresses").insert({
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.postal_code,
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
      const user = await db("users").where({ id: req.userId }).select("username", "email").first();
  
      const address = await db("addresses")
        .where({ user_id: req.userId })
        .select("street", "city", "state", "postal_code", "country")
        .first();
  
      const orders = await db("orders")
        .where({ user_id: req.userId })
        .select("id", "total as total"); // Fixed the column name from `total_price` to `total`.
  
      if (user) {
        res.status(200).json({
          user: {
            ...user,
            address: address
              ? {
                  street: address.street,
                  city: address.city,
                  state: address.state,
                  postal_code: address.postal_code, // Updated the field name.
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
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const [orderId] = await db("orders").insert({
      user_id: req.userId,
      status: "Processing",
      total_price: totalPrice,
    });

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
    }));

    await db("order_items").insert(orderItems);

    res.status(201).json({ orderId, status: "Processing", items });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Stripe Payment Intent
// Stripe Payment Intent
app.post("/create-payment-intent", authenticate, async (req, res) => {
    const { amount, shippingAddressId } = req.body;
  
    if (!amount || !shippingAddressId) {
      return res.status(400).json({ error: "Amount and shipping address are required." });
    }
  
    try {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
  
      // Create an order in the database
      const [orderId] = await db("orders").insert({
        user_id: req.userId,
        shipping_address_id: shippingAddressId,
        status: "pending",
        total: (amount / 100).toFixed(2), // Convert cents to dollars
        created_at: new Date(),
        updated_at: new Date(),
      });
  
      res.status(200).json({ clientSecret: paymentIntent.client_secret, orderId });
    } catch (error) {
      console.error("Error creating payment intent:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Stripe Webhook
  const endpointSecret = "whsec_4ca11e911f9f9ec20aca42fa3d30f6456d5bc9c201e3541e450606d9cbbf79e0";
  
  app.post("/webhook", (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
  
        // Update order status to completed
        db("orders")
          .where({ id: paymentIntent.metadata.orderId }) // Ensure metadata.orderId is sent when creating payment intent
          .update({ status: "completed", updated_at: new Date() })
          .then(() => console.log("Order marked as completed"))
          .catch((error) => console.error("Error updating order status:", error.message));
        break;
  
      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object);
        break;
  
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    res.status(200).send();
  });

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
