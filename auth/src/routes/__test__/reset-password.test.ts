import request from 'supertest'
import { app } from '../../app'

import { randomBytes } from 'crypto'

// Models
import { User, UserDoc } from '../../models/user'
import { Token, TokenType } from '../../models/token'

// Helper
import { addHoursToDate } from '../../helpers/date'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'
import { Subjects } from '@chato-zombilet/common'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

const createUser = async () => {
    // Create a user
    const user = User.build({
        email: 'test@test.com',
        password: '12345678'
    })
    await user.save()

    return user
}

const createToken = async (user: UserDoc) => {
    // Create a 'forgot-password' token
    const value = randomBytes(32).toString('hex')
    const expiresAt = addHoursToDate(new Date(), 1)
    const token = Token.build({
        user,
        value,
        type: TokenType.ForgotPassword,
        expiresAt
    })
    await token.save()

    return { token, plainTokenValue: value }
}

it('returns a 400 with an invalid newPassword and repeatedNewpassword', async () => {
    // Pre-conditions
    const user = await createUser()
    const { token, plainTokenValue } = await createToken(user)

    await request(app)
        .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            newPassword: '11',
            repeatedNewPassword: '11'
        })
        .expect(400)
})

it('returns a 400 with missing newPassword or repeatedNewPassword', async () => {
    // Pre-conditions
    const user = await createUser()
    const { token, plainTokenValue } = await createToken(user)

    // Missing both 'newPassword' and 'repeatedNewPassword'
    await request(app)
    .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            charisma: true,
        })
        .expect(400)
    
    // Missing 'repeatedNewPassword'
    await request(app)
    .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            newPassword: '11111111',
        })
        .expect(400)
    
    // Missing 'newPassword'
    await request(app)
    .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            repeatedNewPassword: '11111111',
        })
        .expect(400)
})

it('returns a 401 with the non-existing user', async () => {
    // Pre-conditions
    const user = await createUser()
    const { token, plainTokenValue } = await createToken(user)

    // Delete the user
    await User.deleteOne({
        id: user.id
    })

    const res = await request(app)
    .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            newPassword: '11111111',
            repeatedNewPassword: '11111111'
        })
        .expect(401)
    console.log(res.body)

    // Event Assertion
    // // Publisher Not Invoked: 'user-reset-password'
    expect(natsWrapper.client.publish).not.toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(0)
})

it(`deletes all the existing tokens that the existing user has`, async () => {
    // Pre-conditions
    const user = await createUser()
    const { token, plainTokenValue } = await createToken(user)

    await request(app)
    .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            newPassword: '11111111',
            repeatedNewPassword: '11111111'
        })
        .expect(200)

    // Token Assertion
    const numberOfTokens = await Token.count({
        userId: user.id
    })
    expect(numberOfTokens).toEqual(0)
})

it(`publishes a 'user:changed-password' event`, async () => {
    // Pre-conditions
    const user = await createUser()
    const { token, plainTokenValue } = await createToken(user)

    await request(app)
        .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            newPassword: '11111111',
            repeatedNewPassword: '11111111'
        })
        .expect(200)

    // Event Assertion
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
    // // Event Subject
    const createdEventSubject = natsWrapperSpy.mock.calls[0][0]
    expect(createdEventSubject).toEqual(Subjects.UserChangedPassword)
})

it('returns a 200 with the existing user resets password', async () => {
    const email = 'test@test.com'
    const firstPassword = 'Password123'
    await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password: firstPassword
        })
        .expect(201)

    // Fetch the user
    const user = await User.findOne({
        email
    })

    // Create a token
    const { token, plainTokenValue } = await createToken(user!)

    // Test
    const newPassword = '11111111'
    await request(app)
        .post(`/api/users/reset-password?token=${plainTokenValue}&type=${token.type}`)
        .send({
            newPassword,
            repeatedNewPassword: newPassword
        })
        .expect(200)

    // Assert
    await request(app)
        .post('/api/users/signin')
        .send({
            email,
            password: firstPassword
        })
        .expect(400)

    await request(app)
        .post('/api/users/signin')
        .send({
            email,
            password: newPassword
        })
        .expect(200)
})
