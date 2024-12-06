const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { customerEmail, adminEmail, orderDetails } = req.body;

  if (!customerEmail || !adminEmail || !orderDetails) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "your_email@gmail.com",
      to: customerEmail,
      subject: "Order Confirmation",
      html: `<h1>Thank you for your order!</h1>
             <p>Order Summary:</p>
             <ul>
               ${orderDetails.products
                 .map(
                   (product) =>
                     `<li>${product.name} - $${product.price} x ${product.quantity}</li>`
                 )
                 .join("")}
             </ul>
             <p>Total: $${orderDetails.total}</p>`,
    });

    await transporter.sendMail({
      from: "oootlichno@gmail.com",
      to: adminEmail,
      subject: "New Order Received",
      html: `<h1>New Order Received</h1>
             <p>Customer: ${orderDetails.customerName}</p>
             <p>Order Summary:</p>
             <ul>
               ${orderDetails.products
                 .map(
                   (product) =>
                     `<li>${product.name} - $${product.price} x ${product.quantity}</li>`
                 )
                 .join("")}
             </ul>
             <p>Total: $${orderDetails.total}</p>`,
    });

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Failed to send emails" });
  }
});

module.exports = router;
