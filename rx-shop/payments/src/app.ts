import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rx-demo/common';
import { paymentRouter } from './routes/payment-router';



const app = express();

// The reason for this that traffic is being prixy to our app through ingress nginx
app.set('trust proxy', true);

app.use(express.json());

app.use(cookieSession({
    signed: false, // Disable encrypction in cookie
    // secure : true, // use cookie only on https connection
    secure: process.env.NODE_ENV !== 'test'
}));

app.use(currentUser);
app.use(paymentRouter);


app.all('*', async () => {
    throw new NotFoundError();
});
app.use(errorHandler);

export { app };
