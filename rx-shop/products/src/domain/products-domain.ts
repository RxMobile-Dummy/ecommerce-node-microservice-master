import { BadRequestError, NotAuthorizedError, NotFoundError } from '@rx-demo/common';
import { Request, Response } from 'express';
import { ProductCreatedPublisher } from '../events/publisher/product-created-publisher';
import { ProductUpadtedPubllisher } from '../events/publisher/product-updated-publisher';
import { Product } from '../models/products';
import { natsWrapper } from '../nats-wrapper';


export class ProductsDomain {

    // CREATE-PRODUCT
    static async createProduct(req: Request, res: Response) {
        const { name, price, quantity } = req.body;
        const product = Product.build({
            name: name,
            price: price,
            quantity: quantity,
            userId: req.currentUser?.id!
        });
        await product.save();

        await new ProductCreatedPublisher(natsWrapper.client).publish({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            version: product.version,
            userId: product.userId
        });

        res.status(201).send(product);
    }

    // GET ALL PRODUCTS
    static async getAllProducts(req: Request, res: Response) {
        const response = await Product.find({});
        return res.status(200).send(response);
    }

    // GET PRODUCT BY ID    
    static async getProductById(req: Request, res: Response) {
        const product = await Product.findById(req.params.id.toString());

        if (!product) {
            throw new NotFoundError();
        }
        res.send(product);
    }

    // UPDATE PRODUCT
    static async updateProductById(req: Request, res: Response) {

        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new NotFoundError();
        }

        if (product.orderId) {
            throw new BadRequestError('cant edit a reserved product')
        }
        if (product.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        product.set({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity
        });

        await product.save();

        await new ProductUpadtedPubllisher(natsWrapper.client).publish({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            version: product.version,
            userId: product.userId
        });

        res.status(201).send(product);
    }
}