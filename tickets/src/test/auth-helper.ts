import jwt from 'jsonwebtoken'
import { getValidObjectId } from './valid-id-generator'

const getValidCookie = async () => {
    /* Fake Cookie */
    /* async even if no await inside */

    // Build a JWT payload | { id, email }
    const id = getValidObjectId()

    const userPayload = {
        id,
        email: `test.${id}@test.com`
    }

    // Create the JWT!
    const userSecret = process.env.JWT_KEY!
    const userJwt = jwt.sign(userPayload, userSecret)

    // Build session object | { jwt: MY_JWT }
    const session = {
        jwt: userJwt
    }

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session)

    // Take JSON and encode it as base64
    const base64Data = Buffer.from(sessionJSON).toString('base64')

    // Return a string that's the cookie with the encoded data
    return `session=${base64Data}`
}

export { getValidCookie }
