import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken'
declare global {
    var signin: () => string[];
}

jest.mock('../nats-wrapper')


let mongo: any;
// Work before  all test start
beforeAll(async () => {
    process.env.JWT_KEY = 'mySecretKey';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

// Work before each test
beforeEach(async () => {
    //Reset data logic
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }

});

// Work after all test
afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    // Build jwt payload
    const payload = {
        id: id,
        email: "test@test.com",

    }

    // Create jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object {jwt : MY_JWT}
    const session = { jwt: token };

    // Turn that session inti JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSOn and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string thats the cookie with the encoded data 
    const cookie = [`session=${base64}`];

    return cookie;




}