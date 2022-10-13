import { Publisher, OrderCancelledEvent, Subjects } from '@rx-demo/common'

export class OrderCancelledublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

}