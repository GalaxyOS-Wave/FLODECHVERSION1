# Flodech Vercel Deployment Guide

Use this production guide to deploy your academy management SaaS (`Flodech`) to Vercel with real Razorpay subscriptions and automatic Firebase database synchronization.

---

## 1. Environment Variables Configuration

Make sure the following exact secrets are configured inside your Vercel Project Settings under **Environment Variables**:

| Variable Name | Description | Example / Note |
| :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Your live or test Razorpay Key ID | `rzp_live_xxxxxxxx` or `rzp_test_xxxxxx` |
| `RAZORPAY_KEY_SECRET` | Your live or test Razorpay Key Secret | Secured secret key from Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Cryptographic secret for webhook authentication | Chosen by you when defining the Webhook URL |
| `GEMINI_API_KEY` | Server-safe API key for generative learning elements | Configured via AI Studio secrets |

---

## 2. Setting Up Razorpay Webhooks

Once your Vercel application is deployed and live (e.g., `https://flodech.vercel.app`):

1. Go to your **Razorpay Dashboard** &rarr; **Settings** &rarr; **Webhooks**.
2. Click **Add New Webhook**.
3. Set the **Webhook URL** to your server endpoint:
   ```txt
   https://your-vercel-domain.com/api/webhooks/razorpay
   ```
4. Enter a highly secure custom string as the **Secret** (and make sure to add this exact string as `RAZORPAY_WEBHOOK_SECRET` in Vercel's Project environment settings).
5. In the **Active Events** checklist, select the following events:
   - [x] `subscription.charged`
   - [x] `subscription.activated`
   - [x] `subscription.completed`
   - [x] `subscription.cancelled`
   - [x] `payment.failed`
6. Click **Save Webhook**.

---

## 3. Serverless Integration (`vercel.json`)

Since Vercel automatically deploys front-end code as static and executes backend endpoints using serverless functions, update your `vercel.json` if building multi-threaded server routing. 

For the combined Vite spa static deployment and Server middleware, configure the file tree redirect settings:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 4. Production Webhook Verification Checklist

Every single Razorpay subscription event (charge updates, activation, completion, and failures) is fully backed by **SHA-256 HMAC cryptographic verification**. You can rest assured that:
- Unauthorized third-party webhook simulators are blocked.
- Databases are synced safely within standard ACID/Firestore guidelines.
- Upgraded teacher profiles are activated instantly.
