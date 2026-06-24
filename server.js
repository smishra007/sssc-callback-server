const express = require("express");
const app = express();

app.use(express.json());

// ─── Config ───────────────────────────────────────────────────────────────────
// Zip codes that should return ADDRESS_ERROR
const BLOCKED_ZIP_CODES = ["29200", "29201", "95123"]; // customize as needed

// Default shipping options returned on a happy-path address
const DEFAULT_SHIPPING_OPTIONS = [
  {
    id: "SHIP_123",
    label: "Standard Shipping",
    type: "SHIPPING",
    selected: true,
    amount: { currency_code: "USD", value: "0.00" },
  },
  {
    id: "SHIP_456",
    label: "Express Shipping",
    type: "SHIPPING",
    selected: false,
    amount: { currency_code: "USD", value: "9.99" },
  },
];

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "SSSC callback server is running" });
});

// ─── Shipping callback endpoint ───────────────────────────────────────────────
app.post("/order-update-callback", (req, res) => {
  const body = req.body;

  console.log("──────────────────────────────────────");
  console.log("Incoming callback payload:");
  console.log(JSON.stringify(body, null, 2));
  console.log("──────────────────────────────────────");

  // Extract shipping address from the callback payload
  const shippingAddress =
    body?.shipping_address ||
    body?.purchase_units?.[0]?.shipping?.address ||
    null;

  const postalCode =
    shippingAddress?.postal_code ||
    shippingAddress?.postcode ||
    null;

  console.log(`Postal code received: ${postalCode}`);

  // ── ADDRESS_ERROR: blocked zip code ───────────────────────────────────────
  if (postalCode && BLOCKED_ZIP_CODES.includes(postalCode)) {
    console.log(`Blocked zip code detected: ${postalCode} → returning ADDRESS_ERROR`);
    return res.status(422).json({
      name: "UNPROCESSABLE_ENTITY",
      details: [
        {
          issue: "ADDRESS_ERROR",
          description: `Shipping is not available to zip code ${postalCode}.`,
        },
      ],
    });
  }

  // ── Happy path: return shipping options ───────────────────────────────────
  console.log("Happy path → returning shipping options");
  return res.status(200).json({
    purchase_units: [
      {
        shipping: {
          options: DEFAULT_SHIPPING_OPTIONS,
        },
        amount: {
          currency_code: "USD",
          value: "32.00",
          breakdown: {
            item_total:   { currency_code: "USD", value: "29.00" },
            tax_total:    { currency_code: "USD", value: "3.00" },
            handling:     { currency_code: "USD", value: "1.00" },
            discount:     { currency_code: "USD", value: "1.00" },
            shipping:     { currency_code: "USD", value: "0.00" }, // updates when option changes
          },
        },
      },
    ],
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SSSC callback server listening on port ${PORT}`);
});
