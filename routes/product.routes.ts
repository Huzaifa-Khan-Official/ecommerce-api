import express from 'express';
import {
    createProduct,
    getProducts,
    getProductBySlug,
    updateProduct,
    deleteProduct
} from '../controller/product.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, uploadMultiple, asyncHandler(createProduct));

router.route('/:slug').get(asyncHandler(getProductBySlug));

router.route('/:id')
    .put(protect, admin, uploadMultiple, asyncHandler(updateProduct))
    .delete(protect, admin, asyncHandler(deleteProduct));

export default router;