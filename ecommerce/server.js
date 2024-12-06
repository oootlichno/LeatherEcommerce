const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config();

const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const productRoutes = require("./routes/productRoutes");
const upsRoutes = require("./routes/upsRoutes");
const { router: authRoutes } = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/webhook", bodyParser.raw({ type: "application/json" }));

app.use("/cart", cartRoutes);
app.use("/users", userRoutes);
app.use("/payments", paymentRoutes);
app.use("/products/search", searchRoutes);
app.use("/products", productRoutes);
app.use("/api/ups", upsRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}