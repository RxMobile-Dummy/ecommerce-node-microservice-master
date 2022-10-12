import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

declare global {
    var signin: () => Promise<string[]>
}

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

global.signin = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        }).expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
}