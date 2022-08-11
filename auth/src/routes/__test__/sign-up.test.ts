import request from 'supertest'
import { app } from '../../app'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'
import { Subjects } from '@chato-zombilet/common'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)
})


it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'testtest.com',
            password: 'Password123'
        })
        .expect(400)
})

it('returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'pw'
        })
        .expect(400)
})

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com'
        })
        .expect(400)

    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'Password123'
        })
        .expect(400)
})

it('returns a 400 with existing email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(400)
})

it('sets a cookie after successful signup', async() => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)
    
    expect(response.get('Set-Cookie')).toBeDefined()
})

it(`publishes a 'user:signed-up' event`, async () => {
    // Test
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    // Event Assertion
    // // Publisher Invoked: 'user-signed-up'
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    // // Event Subject
    const createdEventSubject = natsWrapperSpy.mock.calls[0][0]
    expect(createdEventSubject).toEqual(Subjects.UserSignedUp)
})
