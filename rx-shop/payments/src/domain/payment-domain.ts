import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus } from '@rx-demo/common';
import { Request, Response } from 'express';
import { stripe } from '../stripe';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats-wrapper';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';

export class PaymentDomain {
    static async createPayemt(req: Request, res: Response) {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('can not pay for cancelled order')
        }

        const charge = await stripe.paymentIntents.create({
            currency: 'inr',
            // ₹1= 100 paisa
            amount: order.price * 100,
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        });

        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });

        res.status(201).send({ id: payment.id })
    }
}