import { Publisher, OrderCancelledEvent, Subjects, OrderCreatedEvent } from '@rx-demo/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

}