import mongoose, { Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    tags: string[];
    price: number;
    color: string;
    size: 'sm' | 'md' | 'lg' | 'xl';
    images: string[];
    inStock: boolean;
    totalStock: number;
    soldCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    price: { type: Number, required: true },
    color: { type: String, required: true },
    size: { type: String, enum: ['sm', 'md', 'lg', 'xl'], required: true },
    images: [{ type: String }],
    inStock: { type: Boolean, default: true },
    totalStock: { type: Number, required: true },
    soldCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;