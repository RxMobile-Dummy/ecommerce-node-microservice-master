import { requireAuth, validateRequest } from '@rx-demo/common';
import express from 'express';
import { CartDomain } from '../domain/cart-domain';
import { body } from 'express-validator';

const Router = express.Router();

// SHOW CART
Router.get('/api/cart',
    requireAuth,
    CartDomain.showCart
);

// ADD-TO-CART
Router.post('/api/cart', 
    requireAuth,
    [
        body('productId').trim().notEmpty().withMessage('You Must supply a productId')
    ],
    validateRequest, 
    CartDomain.addToCart
);

// REMOVE-FROM-CART
Router.put('/api/cart', 
    requireAuth,
    [
        body('productId').trim().notEmpty().withMessage('You Must supply a productId')
    ],
    validateRequest, 
    CartDomain.removeFromCart
);


export { Router as cartRouter }