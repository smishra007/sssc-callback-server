const express = require("express");
const app = express();

app.use(express.json());

// ─── Config ───────────────────────────────────────────────────────────────────
const BLOCKED_ZIP_CODES = ["29200", "29201", "29202", "95123"];

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

  const postalCode = body?.shipping_address?.postal_code || null;
  console.log(`Postal code received: ${postalCode}`);

  // ── ADDRESS_ERROR: blocked zip codes ──────────────────────────────────────
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

  // ── Zip 95131: 2 shipping options ─────────────────────────────────────────
  if (postalCode === "95131") {
    console.log("Zip 95131 → returning 2 shipping options");
    return res.status(200).json({
      id: body.id,
      amount: { currency_code: "USD", value: "32.00" },
      shipping_options: [
        {
          id: "1",
          amount: { currency_code: "USD", value: "0.00" },
          type: "SHIPPING",
          description: "Free Shipping",
          selected: true
        },
        {
          id: "2",
          amount: { currency_code: "USD", value: "9.99" },
          type: "SHIPPING",
          description: "Express Shipping",
          selected: false
        }
      ]
    });
  }

  // ── Default: 1 shipping option ────────────────────────────────────────────
  console.log("Default zip → returning 1 shipping option");
  return res.status(200).json({
    id: body.id,
    amount: { currency_code: "USD", value: "32.00" },
    shipping_options: [
      {
        id: "1",
        amount: { currency_code: "USD", value: "0.00" },
        type: "SHIPPING",
        description: "Free Shipping",
        selected: true
      }
    ]
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SSSC callback server listening on port ${PORT}`);
});
