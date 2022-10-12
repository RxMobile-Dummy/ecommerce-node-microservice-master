import { ProductUpdatedEvent, Publisher, Subjects } from "@rx-demo/common";

export class ProductUpadtedPubllisher extends Publisher<ProductUpdatedEvent>{
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;

}