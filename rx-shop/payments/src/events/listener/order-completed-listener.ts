import { Listener, OrderCompletedEvent, OrderStatus, Subjects } from "@rx-demo/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    subject: Subjects.OrderCompleted = Subjects.OrderCompleted;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCompletedEvent['data'], msg: Message) {
        const order = await Order.findOne({ _id: data.id });

        if (!order) {
            throw new Error('Order Not Found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }

}