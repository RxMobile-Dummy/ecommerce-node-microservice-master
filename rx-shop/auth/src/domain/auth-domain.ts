import { BadRequestError } from '@rx-demo/common';
import { Request, Response } from 'express';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { Password } from '../services/password';

export class AuthDomain {

    // SIGNUP
    static async signUp(req: Request, res: Response) {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new BadRequestError('Email In Use');
        }

        const user = User.build({ email, password });
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY! ,
            // {expiresIn: '10s'}
        )

        // Store it on session object 
        req.session = { jwt: userJwt }
        return res.status(201).send(user);
    }

    // SIGNIN
    static async signIn(req: Request, res: Response) {
        const { email, password } = req.body
        const exitstingUser = await User.findOne({ email });
        if (!exitstingUser) {
            throw new BadRequestError('Invalid credentials')
        }
        const passwordMatch = await Password.compare(exitstingUser.password, password);

        if (!passwordMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generate JWT
        const userJwt = jwt.sign({
            id: exitstingUser.id,
            email: exitstingUser.email
        }, process.env.JWT_KEY! ,
            //{expiresIn: '10s'}
        )

        // Store it on session object 
        req.session = { jwt: userJwt }
        return res.status(200).send(exitstingUser);
    }

    // SIGN-OUT
    static async signOut(req: Request, res: Response) {
        req.session = null;
        res.send({});
    }

    // CURRENT_USER
    static async currentUser(req: Request, res: Response) {
        res.send({ currentUser: req.currentUser || null });
    }
}