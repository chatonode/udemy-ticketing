import request from 'supertest'
import { app } from '../../app'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'
import { Subjects } from '@chato-zombilet/common'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

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


it(`publishes a 'user:signed-in' event`, async () => {
    // Pre-Condition
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    // Test
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(200)

    // Event Assertion
    // // Publisher Invoked: 'user-signed-in'
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    // // 'user-signed-up' + 'user-signed-in'
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
    // // Event Subject
    const createdEventSubject = natsWrapperSpy.mock.calls[1][0]
    expect(createdEventSubject).toEqual(Subjects.UserSignedIn)
})
