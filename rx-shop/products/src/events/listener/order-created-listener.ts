import { BadRequestError, Listener, OrderCreatedEvent, Subjects } from "@rx-demo/common";
import { ObjectId } from "mongodb";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/products";
import { ProductUpadtedPubllisher } from "../publisher/product-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        
        const productsData = data.productList;

        await Promise.all(productsData.map(async (element: any) => {
            const id = element._id;
            const quantity = Number(element.purchaseQuantity);

            if (!ObjectId.isValid(id)) {
                throw new BadRequestError('invalid product id');
            }
            const product = await Product.findById(id);
            if (!product) {
                throw new BadRequestError('invalid product');
            }

            const currentQuantity = product.quantity - quantity ;

            product.set({
                quantity : currentQuantity
            });

            await product.save();

            await new ProductUpadtedPubllisher(this.client).publish({
                id : product.id,
                name  : product.name,
                price : product.price,
                quantity : product.quantity,
                userId : product.userId,
                version : product.version,
                available : product.available
            });
        }));

        // ack the message 
        msg.ack();

    }

}