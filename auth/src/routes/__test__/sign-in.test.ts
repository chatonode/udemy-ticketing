import request from 'supertest'
import { app } from '../../app'

it('returns a 200 on successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(200)
})

it('returns a 400 with an invalid email', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'testtest.com',
            password: 'Password123'
        })
        .expect(400)
})

it('returns a 400 with missing password', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com'
        })
        .expect(400)
})

it('returns a 400 with a non-existing email', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(400)
})

it('returns a 400 with a wrong password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'Password127'
        })
        .expect(400)
})

it('sets a cookie after successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(200)

    expect(response.get('Set-Cookie')).toBeDefined()
})