import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus } from '@rx-demo/common';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { OrderCancelledublisher } from '../events/publisher/order-cancelled-publisher';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { Order } from '../model/order';
import { Product } from '../model/product';
import { natsWrapper } from '../nats-wrapper';

const EXPAIRATION_WINDOW_SECONDS = 1 * 60;

export class ordersDomain {
    static async getAllOrderOfUser(req: Request, res: Response) {
        const order = await Order.find({ userId: req.currentUser?.id }).populate('productList._id');
        res.status(200).send(order);
    }

    static async getSingleOrderOfUser(req: Request, res: Response) {
        const orderId = req.params.orderId;

        if (!ObjectId.isValid(orderId)) {
            throw new BadRequestError('invalid order id');
        }
        const order = await Order.findById(orderId).populate('productList._id');

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId != req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        res.send(order);
    }

    static async cancelOrder(req: Request, res: Response) {
        const orderId = req.params.orderId;

        if (!ObjectId.isValid(orderId)) {
            throw new BadRequestError('invalid order id');
        }

        const order = await Order.findById(orderId).populate('productList._id');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError()
        }
        if (order.status == OrderStatus.Cancelled) {
            throw new BadRequestError(`can't cancle order because order is ${order.status}`)
        }
        order.status = OrderStatus.Cancelled;
        await order.save();

        new OrderCancelledublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            productList: order.productList
        });

        res.status(204).send(order)
    }

    static async createOrder(req: Request, res: Response) {

        const productsData = req.body.productsData;
        var totalPrice = 0;

        await Promise.all(productsData.map(async (element: any) => {
            const id = element._id;
            const quantity = Number(element.purchaseQuantity);


            if (!ObjectId.isValid(id)) {
                throw new BadRequestError('invalid product id');
            }
            const checkProduct = await Product.findById(id);
            if (!checkProduct) {
                throw new BadRequestError('invalid product');
            }

            const checkQuantity = await Product.findOne({ $and: [{ _id: id }, { quantity: { $gte: quantity } }] });
            if (!checkQuantity) {
                throw new BadRequestError(`${checkProduct.name} quantity might be less then ${quantity}`);
            }

            totalPrice = totalPrice + Number(checkQuantity.price * quantity)
        }));

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPAIRATION_WINDOW_SECONDS);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            productList: productsData,
            totalPrice: totalPrice
        });

        await order.save();

        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            userId: order.userId,
            status: order.status,
            expiresAt: order.expiresAt.toISOString(),
            productList: order.productList,
            totalPrice: order.totalPrice

        })

        res.status(201).send(order);

    }

}