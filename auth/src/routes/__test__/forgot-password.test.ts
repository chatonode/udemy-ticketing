import request from 'supertest'
import { app } from '../../app'

// Models
import { User } from '../../models/user'
import { Token } from '../../models/token'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'
import { Subjects } from '@chato-zombilet/common'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

it('returns a 400 with an invalid email', async () => {
    await request(app)
        .post('/api/users/forgot-password')
        .send({
            email: 'testtest.com',
        })
        .expect(400)
})

it('returns a 400 with missing email', async () => {
    await request(app)
        .post('/api/users/forgot-password')
        .send({
            email: ''
        })
        .expect(400)
})

it('returns a 200 with the non-existing user (for least info against malicious users)', async () => {
    const email = 'test@test.com'
    await request(app)
        .post('/api/users/forgot-password')
        .send({
            email
        })
        .expect(200)

    
    const existingToken = await Token.count()

    // Assert
    expect(existingToken).toEqual(0)

    // Event Assertion
    // // Publisher Not Invoked: 'user-forgot-password'
    expect(natsWrapper.client.publish).not.toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0)
})

it(`creates a token`, async () => {
    // Pre-Condition
    const email = 'test@test.com'

    await request(app)
    .post('/api/users/signup')
    .send({
        email,
        password: 'Password123'
    })
    .expect(201)

    await request(app)
        .post('/api/users/forgot-password')
        .send({
            email
        })
        .expect(200)

    const existingUser = await User.findOne({ email })
    
    const existingToken = await Token.findOne({ user: existingUser!.id })

    // Assert
    expect(existingToken).toBeDefined()
})

it(`publishes a 'user:forgot-password' event`, async () => {
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
        .post('/api/users/forgot-password')
        .send({
            email: 'test@test.com',
        })
        .expect(200)

    // Event Assertion
    // // Publisher Invoked: 'user-forgot-password'
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    // // 'user-signed-up' + 'user-forgot-password'
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
    // // Event Subject
    const createdEventSubject = natsWrapperSpy.mock.calls[1][0]
    expect(createdEventSubject).toEqual(Subjects.UserForgotPassword)
})

it('returns a 200 with the existing user forgot password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'Password123'
        })
        .expect(201)

    await request(app)
        .post('/api/users/forgot-password')
        .send({
            email: 'test@test.com',
        })
        .expect(200)
})
