const express = require("express");
const app = express();

app.use(express.json());

// ─── Config ───────────────────────────────────────────────────────────────────
const BLOCKED_ZIP_CODES = ["29200", "29201", "95123"];

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

  const shippingAddress = body?.shipping_address || null;
  const postalCode = shippingAddress?.postal_code || null;

  console.log(`Postal code received: ${postalCode}`);

  // ── ADDRESS_ERROR ─────────────────────────────────────────────────────────
  if (postalCode && BLOCKED_ZIP_CODES.includes(postalCode)) {
    console.log(`Blocked zip: ${postalCode} → ADDRESS_ERROR`);
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

  // ── Happy path ────────────────────────────────────────────────────────────
  console.log("Happy path → returning shipping options");
  return res.status(200).json({
    id: body.id,
    purchase_units: [
      {
        shipping: {
          options: DEFAULT_SHIPPING_OPTIONS,
        },
        amount: {
          currency_code: "USD",
          value: "32.00",  // flat total, no breakdown
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
