import { Publisher, Subjects, OrderCompletedEvent } from '@rx-demo/common'

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent>{
    subject: Subjects.OrderCompleted = Subjects.OrderCompleted;

}