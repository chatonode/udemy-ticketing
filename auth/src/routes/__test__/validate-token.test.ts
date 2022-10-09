import request from 'supertest'
import { app } from '../../app'

import { randomBytes } from 'crypto'

// Models
import { User } from '../../models/user'
import { Token, TokenType } from '../../models/token'

import { addHoursToDate, removeHoursFromDate } from '../../helpers/date'

it('returns a 400 with missing token and type', async () => {
    const charisma = true
    await request(app)
        .post('/api/users/validate-token?')
        .query({
            charisma
        })
        .send()
        .expect(400)
})

it('returns a 400 with missing token', async () => {
    const type = TokenType.ForgotPassword
    await request(app)
        .post('/api/users/validate-token')
        .query({
            type
        })
        .send()
        .expect(400)
})

it('returns a 400 with missing type', async () => {
    const token = '7408a8645042acd3e98090afd655989b6b0b13c2bae83e3e17177f7968eb933e'
    await request(app)
        .post('/api/users/validate-token')
        .query({
            token
        })
        .send()
        .expect(400)
})

it('returns a 400 with invalid type', async () => {
    const token = '7408a8645042acd3e98090afd655989b6b0b13c2bae83e3e17177f7968eb933e'
    const type = 'FORGET_PASSWORD'  // Conscious typo
    await request(app)
        .post('/api/users/validate-token')
        .query({
            token,
            type
        })
        .send()
        .expect(400)
})

it('returns a 404 with the non-existing token', async () => {
    const token = '7408a8645042acd3e98090afd655989b6b0b13c2bae83e3e17177f7968eb933e'
    const type = TokenType.ForgotPassword
    await request(app)
        .post('/api/users/validate-token')
        .query({
            token,
            type
        })
        .send()
        .expect(404)
})

it(`returns a 404 with the existing token as another type`, async () => {
    /* Pre-Condition */
    // Create a user
    const email = 'test@test.com'

    await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password: 'Password123'
        })
        .expect(201)

    const existingUser = await User.findOne({ email })

    // Create a token
    const value = randomBytes(32).toString('hex')
    const expiresAt = addHoursToDate(new Date(), 1)
    const token = Token.build({
        user: existingUser!,
        value,
        type: TokenType.ForgotPassword,
        expiresAt
    })
    await token.save()

    /* Assert */
    await request(app)
        .post('/api/users/validate-token')
        .query({
            token: value,
            type: TokenType.DeleteAccount
        })
        .send()
    .expect(404)

})

it(`returns a 401 with the existing and expired token`, async () => {
    /* Pre-Condition */
    // Create a user
    const email = 'test@test.com'

    await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password: 'Password123'
        })
        .expect(201)

    const existingUser = await User.findOne({ email })

    // Create a token
    const value = randomBytes(32).toString('hex')
    const expiresAt = removeHoursFromDate(new Date(), 48)
    const token = Token.build({
        user: existingUser!,
        value,
        type: TokenType.ForgotPassword,
        expiresAt
    })
    await token.save()

    /* Assert */
    await request(app)
        .post('/api/users/validate-token')
        .query({
            token: value,
            type: token.type
        })
        .send()
    .expect(401)
    
})

it(`validates and returns a 200 with the existing and non-expired token`, async () => {
    /* Pre-Condition */
    // Create a user
    const email = 'test@test.com'

    await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password: 'Password123'
        })
        .expect(201)

    const existingUser = await User.findOne({ email })

    // Create a token
    const value = randomBytes(32).toString('hex')
    const expiresAt = addHoursToDate(new Date(), 1)
    const token = Token.build({
        user: existingUser!,
        value,
        type: TokenType.ForgotPassword,
        expiresAt
      })
      await token.save()

    /* Assert */
    await request(app)
        .post('/api/users/validate-token')
        .query({
            token: value,
            type: token.type
        })
        .send()
    .expect(200)

})
