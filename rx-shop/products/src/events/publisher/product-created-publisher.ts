import { ProductCreatedEvent, Publisher, Subjects } from "@rx-demo/common";

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
    subject: Subjects.ProductCreated = Subjects.ProductCreated;

}