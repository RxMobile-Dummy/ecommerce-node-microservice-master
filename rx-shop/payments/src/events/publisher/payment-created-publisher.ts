import { PaymentCreatedEvent, Publisher, Subjects } from "@rx-demo/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.paymentCreated = Subjects.paymentCreated;

}