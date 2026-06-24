# SSSC Callback Server

A lightweight Node.js server that handles PayPal Server-Side Shipping Callbacks (SSSC).

## What it does

- Returns **200 + shipping options** for any valid address (happy path)
- Returns **422 ADDRESS_ERROR** for blocked zip codes you configure
- Logs every inbound callback payload to the console

## Blocked zip codes

Edit the `BLOCKED_ZIP_CODES` array at the top of `server.js` to add/remove zip codes that should trigger `ADDRESS_ERROR`:

```js
const BLOCKED_ZIP_CODES = ["29200", "29201", "29202"];
```

## Local testing (optional)

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

Test it locally with curl:

```bash
# Happy path
curl -X POST http://localhost:3000/order-update-callback \
  -H "Content-Type: application/json" \
  -d '{"shipping_address": {"postal_code": "90210"}}'

# ADDRESS_ERROR
curl -X POST http://localhost:3000/order-update-callback \
  -H "Content-Type: application/json" \
  -d '{"shipping_address": {"postal_code": "29200"}}'
```

---

## Deploy to Render (step by step)

### Step 1 — Push code to GitHub

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **New repository** → name it `sssc-callback-server` → click **Create repository**
3. On your computer, open Terminal and run:

```bash
cd sssc-callback-server
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sssc-callback-server.git
git push -u origin main
```

### Step 2 — Deploy on Render

1. Go to [render.com](https://render.com) and sign in with your GitHub account
2. Click **New +** → **Web Service**
3. Select your `sssc-callback-server` repository
4. Fill in these settings:
   - **Name**: `sssc-callback-server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Create Web Service**
6. Wait ~2 minutes for the deploy to finish
7. Copy your public URL — it will look like: `https://sssc-callback-server.onrender.com`

### Step 3 — Use the URL in your PayPal order

Set `order_update_callback_config.callback_url` to:

```
https://sssc-callback-server.onrender.com/order-update-callback
```

### Step 4 — View logs

In the Render dashboard, click your service → **Logs** tab. Every incoming callback payload will be printed there so you can see exactly what PayPal's STCS is sending.
