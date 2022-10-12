import express, { Request, Response, Router } from 'express';
import { currentUser, validateRequest } from '@rx-demo/common';
import { body } from 'express-validator';
import { AuthDomain } from '../domain/auth-domain';

const router = express.Router();

// SIGN-UP
router.post('/api/users/signup', [
    body('email').isEmail().withMessage('email must be valid'),
    body('password').trim().isLength({ min: 8, max: 20 }).withMessage('password must be between 4 and 20 characters')
],
    validateRequest,
    AuthDomain.signUp
);

// SIGN-IN
router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Email Must Be Valid'),
    body('password').trim().notEmpty().withMessage('You Must supply a password')
],
    validateRequest,
    AuthDomain.signIn
);

// SIGN-OUT
router.post('/api/users/signout',
    AuthDomain.signOut
);

// CURRENT_USER
router.get('/api/users/currentuser',
    currentUser,
    AuthDomain.currentUser);


export { router as authRouter }