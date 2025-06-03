import { Request, Response } from 'express';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

export const getCart = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return res.json({ items: [] });
        }
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { productId, color, size, quantity = 1 } = req.body;

        
        const product = await Product.findById(productId);
        if (!product || !product.inStock) {
            return res.status(400).json({ message: 'Product not available' });
        }

        
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }

        
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId &&
                item.color === color &&
                item.size === size
        );

        if (existingItemIndex >= 0) {
            
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            
            cart.items.push({
                product: productId,
                color,
                size,
                quantity
            });
        }

        await cart.save();

        
        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        res.status(201).json(populatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id && item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            
            cart.items.splice(itemIndex, 1);
        } else {
            
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id && item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const clearCart = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $set: { items: [] } },
            { new: true }
        ).populate('items.product');

        res.json(cart || { items: [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};