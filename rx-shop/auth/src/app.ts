import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@rx-demo/common';
import { authRouter } from './routes/auth-router';


const app = express();

// The reason for this that traffic is being prixy to our app through ingress nginx
app.set('trust proxy', true);

app.use(express.json());

app.use(cookieSession({
    signed: false, // Disable encrypction in cookie
    // secure : true, // use cookie only on https connection
    secure: process.env.NODE_ENV !== 'test'
}));

// Router
app.use(authRouter);

app.all('*', async () => {
    throw new NotFoundError();
});
app.use(errorHandler);

export { app };
