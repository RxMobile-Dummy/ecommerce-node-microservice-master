import mongoose from 'mongoose';
import { app } from './app';
import { ProductCreatedListener } from './events/listener/product-created-listener';
import { ProductUpdatedListener } from './events/listener/product-updated-listener';
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
        throw new Error('NATS_URI must be defined')
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

        //TODO
        // 1) product-created-listener
        new ProductCreatedListener(natsWrapper.client).listen();
        // 2) product-updated-listener
        new ProductUpdatedListener(natsWrapper.client).listen();
        // 3) expiration-complete-listener
        // 4) payment-created-listener


        await mongoose.connect(process.env.MONGO_URI);

    } catch (error: any) {
        throw new Error(error);
    }

    app.listen(port, () => {
        console.log('order is listening on 3000');

    });
}

start();