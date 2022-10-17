import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@rx-demo/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { OrderCompletedPublisher } from "../publisher/order-completed-publisher";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    subject: Subjects.paymentCreated = Subjects.paymentCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        await new OrderCompletedPublisher(this.client).publish({
            id: order.id
        });

        msg.ack();
    }

}