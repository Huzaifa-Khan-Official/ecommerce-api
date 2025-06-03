import mongoose, { Document } from 'mongoose';

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    color: string;
    size: string;
    _id?: mongoose.Types.ObjectId;
}

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    color: { type: String, required: true },
    size: { type: String, enum: ['sm', 'md', 'lg', 'xl'], required: true }
});

const cartSchema = new mongoose.Schema<ICart>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;