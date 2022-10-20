import express from 'express';
import { body, oneOf } from 'express-validator'
import { requireAuth, validateRequest } from '@rx-demo/common'
import { ProductsDomain } from '../domain/products-domain';


const Router = express.Router();

// CREATE PRODUCT
Router.post('/api/products',
    requireAuth,
    [
        body('name').trim().not().isEmpty().withMessage('product name is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then 0'),
        body('quantity').isInt({gt : 0}).withMessage('quantity must be an integer & greater then 0')
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
        body('name').trim().not().isEmpty().withMessage('product name is required').optional(),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then 0').optional(),
        body('quantity').isInt({ gt: 0 }).withMessage('quantity must be an integer & greater then 0').optional(),
        body('available').isBoolean().withMessage('available must be a boolean').optional(),
        oneOf([
            body('name').notEmpty(),
            body('price').notEmpty(),
            body('quantity').notEmpty(),
            body('available').notEmpty()
        ],
        "Atleast one of the field must be provided [name ,price , quantity , available]")
    ],
    validateRequest,
    ProductsDomain.updateProductById
);

export { Router as productRouter }