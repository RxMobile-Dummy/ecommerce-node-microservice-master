import express from 'express';
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@rx-demo/common'
import { ordersDomain } from '../domain/order-domain';

const Router = express.Router();

Router.post('/api/orders',
    requireAuth,
    [
        body('productsData').isArray({ min: 1 }).withMessage('there is no product')
    ],
    validateRequest,
    ordersDomain.createOrder
);

Router.get('/api/orders',
    requireAuth,
    ordersDomain.getAllOrderOfUser
);

Router.get('/api/orders/:orderId',
    requireAuth,
    ordersDomain.getSingleOrderOfUser
);

Router.delete('/api/orders/:orderId',
    requireAuth,
    ordersDomain.cancelOrder
);

export { Router as orderRouter }