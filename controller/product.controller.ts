import { Request, Response } from 'express';
import Product from '../models/product.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { IProduct } from '../models/product.model.js';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, tags, price, color, size, totalStock } = req.body;


        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }


        const imageUrls: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const imageUrl = await uploadToCloudinary(file);
                imageUrls.push(imageUrl);
            }
        }

        const baseSlug = name.replace(/ /g, "-").toLowerCase();

        let slug = baseSlug;

        let existingProduct = await Product.findOne({ slug });

        let counter = 2;

        while (existingProduct) {
            slug = `${baseSlug}-${counter}`;
            existingProduct = await Product.findOne({ slug });
            counter++;
        }

        const product = new Product({
            name,
            slug,
            description,
            tags: tags.split(',').map((tag: string) => tag.trim()),
            price: Number(price),
            color,
            size,
            images: imageUrls,
            totalStock: Number(totalStock),
            inStock: Number(totalStock) > 0
        });

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 12, sort, color, size, minPrice, maxPrice, tag } = req.query;

        const query: any = {};


        if (color) query.color = color;
        if (size) query.size = size;
        if (tag) query.tags = tag;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }


        let sortOption: any = { createdAt: -1 };
        if (sort === 'price-asc') sortOption = { price: 1 };
        if (sort === 'price-desc') sortOption = { price: -1 };
        if (sort === 'popular') sortOption = { soldCount: -1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            totalProducts: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        const { name, description, tags, price, color, size, totalStock } = req.body;

        if (name) {
            product.name = name;
            product.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        if (description) product.description = description;
        if (tags) product.tags = tags.split(',').map((tag: string) => tag.trim());
        if (price) product.price = Number(price);
        if (color) product.color = color;
        if (size) product.size = size;
        if (totalStock) {
            product.totalStock = Number(totalStock);
            product.inStock = Number(totalStock) > 0;
        }


        if (req.files && Array.isArray(req.files)) {
            const imageUrls: string[] = [];
            for (const file of req.files) {
                const imageUrl = await uploadToCloudinary(file);
                imageUrls.push(imageUrl);
            }
            product.images = [...product.images, ...imageUrls];
        }

        await product.save();

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};