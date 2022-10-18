import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listener/order-cancelled-listener';
import { OrderCompletedListener } from './events/listener/order-completed-listener';
import { OrderCreatedListener } from './events/listener/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const port = 3000;

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined')
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined')
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined')
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }

    if (!process.env.NATS_URI) {
        throw new Error('NATS_URII must be defined')
    }
    try {

        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URI
        );

        natsWrapper.client.on('close', () => {
            process.exit();

        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderCompletedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);

    } catch (error: any) {

        throw new Error(error)

    }

    app.listen(port);
}

start();