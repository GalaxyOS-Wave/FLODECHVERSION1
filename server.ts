/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

// Enable JSON parse mapping
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(['/api/ping', '/ping'], (req, res) => {
  res.status(200).json({ message: 'pong', vercel: process.env.VERCEL });
});

// Read config to initialize Firebase Client-Server instance on the backend node side
const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseApp: any = null;
let db: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.info('[Firebase backend] Firestore initialized successfully on backend root!');
  } catch (error) {
    console.error('[Firebase backend] Failed to parse and initialize Firestore:', error);
  }
} else {
  console.warn('[Firebase backend] firebase-applet-config.json not found on backend.');
}

let globalPlanId = process.env.RAZORPAY_PLAN_ID?.trim() || '';

async function getOrCreatePlanId(rzp: any): Promise<string> {
  if (globalPlanId) return globalPlanId;
  try {
    const plansResult = await rzp.plans.all();
    const existing = plansResult.items?.find((p: any) => p.item?.name === 'Flodech Pro' && p.item?.amount === 49900);
    if (existing) {
      globalPlanId = existing.id;
      return globalPlanId;
    }
  } catch (err) {
    console.warn('[Razorpay] Failed to look up existing plans, attempting creation:', err);
  }

  try {
    const newPlan = await rzp.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'Flodech Pro',
        amount: 49900,
        currency: 'INR',
        description: 'Monthly unlimited access package for Flodech'
      }
    });
    globalPlanId = newPlan.id;
    console.info('[Razorpay] Dynamically created new plan:', globalPlanId);
    return globalPlanId;
  } catch (err: any) {
    console.error('[Razorpay] Failed to create plan dynamically:', err);
    throw err;
  }
}

// 1. Create Razorpay Subscription Endpoint
app.post(['/api/razorpay/create-subscription', '/razorpay/create-subscription', '/create-subscription'], async (req, res) => {
  try {
    const { academyId, academyName } = req.body;
    if (!academyId) {
      return res.status(400).json({ error: 'Academy ID is required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    console.info(`[Razorpay Debug Create] keyId start: ${keyId?.substring(0, 8)}, secret start: ${keySecret?.substring(0, 4)}`);

    if (!keyId || !keySecret) {
      return res.status(400).json({
        error: 'Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables.'
      });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const planId = await getOrCreatePlanId(rzp);

    const subscription = await rzp.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // 10 years monthly cycles
      quantity: 1,
      notes: {
        academyId,
        academyName: academyName || 'My Academy'
      }
    });

    return res.status(200).json({
      subscriptionId: subscription.id,
      keyId,
      status: subscription.status
    });
  } catch (error: any) {
    console.error('[Razorpay API] Error creating subscription:', error);
    return res.status(500).json({
      error: error?.error?.description || error.message || 'Failed to create subscription. Ensure Razorpay keys in environment variables are correct.'
    });
  }
});

// 2. Verify Razorpay Subscription Payment Endpoint
app.post(['/api/razorpay/verify-subscription', '/razorpay/verify-subscription', '/verify-subscription'], async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature, 
      academyId, 
      academyName 
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !academyId) {
      return res.status(400).json({ error: 'Missing payment parameters or academy details.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      return res.status(500).json({ error: 'Razorpay secret key is not configured.' });
    }

    const signatureSource = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signatureSource)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid Payment Signature - verification failed.' });
    }

    if (db) {
      const subRef = doc(collection(db, 'subscriptions'), razorpay_subscription_id);
      
      const startDate = new Date();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await setDoc(subRef, {
        academyId,
        academyName: academyName || 'Academy',
        razorpayCustomerId: '',
        razorpaySubscriptionId: razorpay_subscription_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'active',
        planName: 'Flodech Pro',
        amount: 499,
        startDate: serverTimestamp(),
        nextBillingDate: Timestamp.fromDate(nextBillingDate),
        createdAt: serverTimestamp()
      });

      const academyRef = doc(db, 'academies', academyId);
      await updateDoc(academyRef, {
        subscriptionStatus: 'active'
      });

      console.info(`[Razorpay Success] Subscription successfully active updated in Firestore for academy: ${academyId}`);
      return res.status(200).json({ success: true, message: 'Subscription successfully activated!' });
    } else {
      return res.status(500).json({ error: 'Firestore backend instance not initialized.' });
    }
  } catch (error: any) {
    console.error('[Razorpay API] Error verifying signature:', error);
    return res.status(500).json({ error: error.message || 'Signature verification failed.' });
  }
});

// 3. Webhook Integration Endpoint
app.post(['/api/razorpay/webhook', '/razorpay/webhook', '/webhook'], async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';

    // If webhook secret is defined, verify the signature
    if (webhookSecret && signature) {
      const rawBody = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[Razorpay Webhook] Invalid signature rejected!');
        return res.status(400).json({ error: 'Invalid signature.' });
      }
    }

    const { event, payload } = req.body;
    console.info(`[Razorpay Webhook] Received webhook event: ${event}`);

    const subscriptionObject = payload?.subscription?.entity;
    if (subscriptionObject) {
      const rzpSubscriptionId = subscriptionObject.id;
      const rzpStatus = subscriptionObject.status;
      const notes = subscriptionObject.notes || {};
      const academyId = notes.academyId;

      if (academyId && db) {
        let mappedStatus: 'active' | 'cancelled' | 'expired' | 'pending' = 'pending';
        
        switch (event) {
          case 'subscription.activated':
          case 'subscription.charged':
            mappedStatus = 'active';
            break;
          case 'subscription.cancelled':
            mappedStatus = 'cancelled';
            break;
          case 'subscription.completed':
            mappedStatus = 'expired';
            break;
          default:
            if (rzpStatus === 'active') mappedStatus = 'active';
            else if (rzpStatus === 'cancelled') mappedStatus = 'cancelled';
            else if (rzpStatus === 'expired') mappedStatus = 'expired';
            break;
        }

        const subRef = doc(collection(db, 'subscriptions'), rzpSubscriptionId);
        await setDoc(subRef, {
          status: mappedStatus,
          updatedAt: serverTimestamp()
        }, { merge: true });

        const academyRef = doc(db, 'academies', academyId);
        await updateDoc(academyRef, {
          subscriptionStatus: mappedStatus
        });

        console.info(`[Razorpay Webhook] Updated subscriptionStatus for ${academyId} to ${mappedStatus} via event ${event}`);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('[Razorpay Webhook] Error processing event:', error);
    return res.status(500).json({ error: error.message || 'Internal processing error.' });
  }
});

// 4. Cancel Razorpay Subscription Endpoint
app.post(['/api/razorpay/cancel-subscription', '/razorpay/cancel-subscription', '/cancel-subscription'], async (req, res) => {
  try {
    const { subscriptionId, academyId } = req.body;
    if (!subscriptionId || !academyId) {
      return res.status(400).json({ error: 'Subscription ID and Academy ID are required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: 'Razorpay keys are not configured.' });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    // Cancel subscription immediately
    const cancelledSub = await rzp.subscriptions.cancel(subscriptionId, false);

    if (db) {
      const subRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(subRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      const academyRef = doc(db, 'academies', academyId);
      await updateDoc(academyRef, {
        subscriptionStatus: 'cancelled'
      });

      console.info(`[Razorpay Cancel] Subscription ${subscriptionId} marked cancelled for academy ${academyId}`);
      return res.status(200).json({ success: true, message: 'Subscription successfully cancelled.' });
    } else {
      return res.status(500).json({ error: 'Firestore backend instance not initialized.' });
    }
  } catch (error: any) {
    console.error('[Razorpay Cancel Link] Error cancelling subscription:', error);
    return res.status(500).json({ error: error?.error?.description || error.message || 'Failed to cancel subscription.' });
  }
});



// Setup dev/production asset pipelines
async function startServer() {
  if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "development") {
    try {
      const vitePkg = 'vite';
      const { createServer: createViteServer } = await import(vitePkg /* vite */);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Failed to load vite in dev mode:', e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback logic for client-side React routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Flodech backend] Server listening on http://0.0.0.0:${PORT}`);
    });
  }

  // Catch-all API fallback to debug unhandled API requests instead of failing silently with HTML
  app.all('/api/*', (req, res) => {
    console.log('[API Unknown Route] Matched fallback for:', req.method, req.url, 'Original:', req.originalUrl);
    res.status(404).json({ error: 'API endpoint not found', path: req.url, original: req.originalUrl });
  });
}

startServer();

export default app;
