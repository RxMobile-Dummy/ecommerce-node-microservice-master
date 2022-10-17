import { ExpirationCompleteEvent, Publisher, Subjects } from "@rx-demo/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
   
}