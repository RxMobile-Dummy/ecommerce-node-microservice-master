import { Listener, ProductCreatedEvent, Subjects } from "@rx-demo/common";
import { Message } from "node-nats-streaming";
import { Product } from "../../model/product";
import { queueGroupName } from "./queue-group-name";

export class ProductCreatedListener extends Listener<ProductCreatedEvent>{
    subject: Subjects.ProductCreated = Subjects.ProductCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: ProductCreatedEvent['data'], msg: Message) {
        const { id, name, price, quantity ,available } = data;
        const product = Product.build({
            id: data.id, name, price, quantity , available
        });

        await product.save();
        msg.ack();

    }

}


