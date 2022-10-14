import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@rx-demo/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/order";
import { OrderCancelledublisher } from "../publisher/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName: string = queueGroupName;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('productList._id');
        if (!order) {
            throw new Error('order not found')
        }

        if(order.status === OrderStatus.Complete){
            return msg.ack();
        }

        if(order.status === OrderStatus.Cancelled){
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled,
        });

        await order.save();

        await new OrderCancelledublisher(this.client).publish({
            id: order.id,
            version: order.version,
            productList : order.productList

        });

        msg.ack();
    }

}