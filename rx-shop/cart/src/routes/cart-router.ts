import { requireAuth } from '@rx-demo/common';
import express from 'express';
import { CartDomain } from '../domain/cart-domain';

const Router = express.Router();

// SHOW CART
Router.get('/api/cart', requireAuth, CartDomain.showCart);

// ADD-TO-CART
Router.post('/api/cart', requireAuth, CartDomain.addToCart);

// REMOVE-FROM-CART
Router.put('/api/cart', requireAuth, CartDomain.removeFromCart);


export { Router as cartRouter }