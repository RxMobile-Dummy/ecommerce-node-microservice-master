import { BadRequestError, NotAuthorizedError, NotFoundError } from '@rx-demo/common';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
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
            userId: req.currentUser?.id!,
            available : true
        });
        await product.save();

        await new ProductCreatedPublisher(natsWrapper.client).publish({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            version: product.version,
            userId: product.userId,
            available : product.available
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
        if (!ObjectId.isValid(req.params.id)) {
            throw new BadRequestError('invalid product id');
        }
        const product = await Product.findById(req.params.id.toString());

        if (!product) {
            throw new NotFoundError();
        }
        res.send(product);
    }

    // UPDATE PRODUCT
    static async updateProductById(req: Request, res: Response) {
        if (!ObjectId.isValid(req.params.id)) {
            throw new BadRequestError('invalid product id');
        }
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new NotFoundError();
        }

        if (product.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        const data = {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            available : req.body.available
        };

       await Product.findByIdAndUpdate(req.params.id , data);
       const updatedProduct = await Product.findById(req.params.id);
       await updatedProduct!.save();
       await new ProductUpadtedPubllisher(natsWrapper.client).publish({
            id: updatedProduct!.id,
            name: updatedProduct!.name,
            price: updatedProduct!.price,
            quantity: updatedProduct!.quantity,
            version: updatedProduct!.version,
            userId: updatedProduct!.userId,
            available : updatedProduct!.available
        });
        res.status(201).send(updatedProduct);
    }

}