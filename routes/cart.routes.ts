import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controller/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(asyncHandler(getCart))
    .post(asyncHandler(addToCart))
    .delete(clearCart);

router.route('/:itemId')
    .put(asyncHandler(updateCartItem))
    .delete(asyncHandler(removeFromCart));

export default router;