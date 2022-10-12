import request from 'supertest';
import { app } from '../../app';

it('returns a 400 on invalid email', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'wrong_email.com',
            password: 'password'

        })
        .expect(400);
});

it('returns a 400 on empty password', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: ''

        })
        .expect(400);
});


it('returns a 400 with an missing email & password', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com'
        })
        .expect(400);

    await request(app)
        .post('/api/users/signin')
        .send({
            password: 'password'
        })
        .expect(400);

});


it('it fails when a email does not exist is supplied  ', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'

        })
        .expect(400);
});

it('it fails when invalid password supplied', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'

        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'wrong_password'

        })
        .expect(400);
});

it('returns a 200 on successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'

        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'

        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});

