import { Listener, ProductUpdatedEvent, Subjects } from "@rx-demo/common";
import { Message } from "node-nats-streaming";
import { Product } from "../../model/product";
import { queueGroupName } from "./queue-group-name";

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent>{
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
        const product = await Product.findById(data.id);
        if (!product) {
            throw new Error('Product not found')
        }

        const { name, price, quantity , available} = data;

        product.set({ name, price, quantity ,available});

        await product.save();

        msg.ack();
    }

}