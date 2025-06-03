import express from 'express';
import { createCheckoutSession, handleStripeWebhook } from '../controller/checkout.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import bodyParser from 'body-parser';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.post('/create-checkout-session', protect, asyncHandler(createCheckoutSession));
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), asyncHandler(handleStripeWebhook));

export default router;