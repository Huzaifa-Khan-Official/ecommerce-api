import { Request, Response } from 'express';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import stripe from '../utils/stripe.js';
import dotenv from 'dotenv';

dotenv.config();

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product') as (typeof Cart & { _id: any, items: any[] }) | null;
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }


        let totalAmount = 0;
        const lineItems: any[] = [];

        for (const item of cart.items) {
            const product = item.product as any;


            const dbProduct = await Product.findById(product._id);
            if (!dbProduct || !dbProduct.inStock || dbProduct.totalStock < item.quantity) {
                return res.status(400).json({
                    message: `Product ${product.name} is not available in the requested quantity`
                });
            }

            const unitAmount = Math.round(product.price * 100);
            totalAmount += unitAmount * item.quantity;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: `${product.color}, Size: ${item.size}`,
                        images: product.images
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            });
        }


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            customer_email: req.user.email,
            metadata: {
                userId: req.user._id.toString(),
                cartId: cart._id.toString()
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(400).send(`Webhook Error: ${message}`);
    }


    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;

        try {

            const cart = await Cart.findById(session.metadata.cartId).populate('items.product');

            if (cart) {
                for (const item of cart.items) {
                    const product = item.product as any;
                    await Product.findByIdAndUpdate(product._id, {
                        $inc: {
                            totalStock: -item.quantity,
                            soldCount: item.quantity
                        },
                        inStock: product.totalStock - item.quantity > 0
                    });
                }


                await Cart.findByIdAndUpdate(session.metadata.cartId, { items: [] });
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
        }
    }

    res.json({ received: true });
};