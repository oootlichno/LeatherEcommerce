const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const UPS_API_BASE_URL = "https://wwwcie.ups.com/rest/Rate"; 
const UPS_USERNAME = process.env.UPS_USERNAME;
const UPS_PASSWORD = process.env.UPS_PASSWORD;
const UPS_ACCESS_KEY = process.env.UPS_ACCESS_KEY;

const SHIPPER_INFO = {
  AddressLine: process.env.SHIPPER_ADDRESS,
  City: process.env.SHIPPER_CITY,
  StateProvinceCode: process.env.SHIPPER_STATE,
  PostalCode: process.env.SHIPPER_ZIP,
  CountryCode: process.env.SHIPPER_COUNTRY || "US",
};

router.post("/calculate-shipping", async (req, res) => {
  const { from, to, weight } = req.body;

  console.log("Request Body:", JSON.stringify(req.body, null, 2));

  if (!from || !to || !weight) {
    console.error("Missing required fields: 'from', 'to', or 'weight'");
    return res.status(400).json({
      error: "Missing required fields: 'from', 'to', or 'weight'",
    });
  }

  try {
    const requestPayload = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "LeatherUp Shipping Rate Request",
          },
        },
        Shipment: {
          Shipper: {
            Address: SHIPPER_INFO,
          },
          ShipTo: {
            Address: {
              AddressLine: to.address,
              City: to.city,
              StateProvinceCode: to.state,
              PostalCode: to.zip,
              CountryCode: to.country || "US",
            },
          },
          Package: {
            PackagingType: {
              Code: "02", 
              Description: "Customer Supplied Package",
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS", 
              },
              Weight: weight.toString(),
            },
          },
        },
      },
    };

    console.log("UPS Request Payload:", JSON.stringify(requestPayload, null, 2));

    const upsResponse = await axios.post(UPS_API_BASE_URL, requestPayload, {
      headers: {
        "Content-Type": "application/json",
        transId: "Transaction001",
        accessLicenseNumber: UPS_ACCESS_KEY,
        Username: UPS_USERNAME,
        Password: UPS_PASSWORD,
      },
    });

    console.log("UPS API Response:", JSON.stringify(upsResponse.data, null, 2));

    res.status(200).json({ rates: upsResponse.data });
  } catch (error) {
    console.error("Error communicating with UPS API:", error.message);
    if (error.response?.data) {
      console.error(
        "UPS Error Details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    res.status(500).json({
      error: "Failed to fetch UPS rates",
      details: error.response?.data || error.message,
    });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "UPS API integration is working!" });
});

module.exports = router;