import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@rx-demo/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queues";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data :OrderCreatedEvent['data'], msg: Message){

       const delay = new Date(data.expiresAt).getTime() - new Date().getTime() ;
       //console.log('delay time in mili-secounds' , delay);
       
       await expirationQueue.add(
           {orderId : data.id},
          {delay }
           );
       msg.ack();
    }

}