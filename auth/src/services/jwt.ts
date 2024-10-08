import { Request } from 'express'

import jwt from 'jsonwebtoken'

import { UserDoc } from '../models/user'

// Centralized JWT Generator
export const signUserIn = (req: Request, user: UserDoc) => {
    // Generate a JWT
    const payload = {
        //TODO: error TS2322: Type 'String' is not assignable to type 'string'.
        id: user.id as string,  // - Defined as 'id?: any;' at Mongoose document
        email: user.email,
        // Maybe add 'version' too?
        // version: user.version
        // // For "Refresh Token / Access Token Mechanism" feature?
    }
    const secretKey = process.env.JWT_KEY!
    const userJwt = jwt.sign(payload, secretKey)
      
    // Store it on session object
    req.session = {
        jwt: userJwt,
    }
}

// Centralized JWT Destroyer
export const signUserOut = (req: Request) => {
    // Destroying a session
    req.session = null
}
