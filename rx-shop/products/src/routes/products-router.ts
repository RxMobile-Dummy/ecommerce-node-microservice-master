import express from 'express';
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@rx-demo/common'
import { ProductsDomain } from '../domain/products-domain';


const Router = express.Router();

// CREATE PRODUCT
Router.post('/api/products',
    requireAuth,
    [
        body('name').trim().not().isEmpty().withMessage('product name is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then 0'),
        body('quantity').isFloat({ gt: 0 }).withMessage('quantity must be greater then 0')
    ],
    validateRequest,
    ProductsDomain.createProduct
);

// GET ALL PRODUCT
Router.get('/api/products',
    ProductsDomain.getAllProducts
);

// GET PRODUCT BY ID    
Router.get('/api/products/:id',
    ProductsDomain.getProductById
);

// UPDATE PRODUCT
Router.put('/api/products/:id',
    requireAuth,
    [
        body('name').trim().not().isEmpty().withMessage('product name is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then 0'),
        body('quantity').isFloat({ gt: 0 }).withMessage('quantity must be greater then 0')
    ],
    validateRequest,
    ProductsDomain.updateProductById
);

export { Router as productRouter }