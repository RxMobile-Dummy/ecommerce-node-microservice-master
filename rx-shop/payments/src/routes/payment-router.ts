import { requireAuth, validateRequest } from "@rx-demo/common";
import express from "express";
import { body } from "express-validator";
import { PaymentDomain } from "../domain/payment-domain";



const router = express.Router();

router.post('/api/payments',
    requireAuth,
    [
        body('orderId').trim().notEmpty()
    ],
    validateRequest,
    PaymentDomain.createPayemt
);


export { router as paymentRouter } 