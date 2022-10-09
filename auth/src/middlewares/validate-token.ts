import { Request, Response, NextFunction } from 'express'
import { query } from 'express-validator'
import { Types } from 'mongoose'

import { NotFoundError, TokenExpiredError, validateRequest } from '@chato-zombilet/common'

import { Token, TokenType } from '../models/token'

interface TokenizedUser {
    id: string
}

// Augmenting Type Definition
declare global {
    namespace Express {
        interface Request {
            tokenizedUser?: TokenizedUser
        }
    }
}

export const tokenRequestRules = () => {
    return [
        query('token')
            .exists()
            .withMessage('Token must be provided.'),
        query('type')
            .exists()
            .withMessage('Token type must be provided.')
            // @ref-link: https://stackoverflow.com/questions/63753808/how-to-check-the-type-is-enum-or-not-in-typescript
            .custom((input: string) => (Object.values(TokenType) as string[]).includes(input))
            .withMessage('Token type must be valid.')
    ]
}

export const validateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    
    const { token, type } = req.query

    // Hash incoming token
    const value = Token.toHash(token as string)

    // Fetch the token
    const existingToken = await Token.findOne({ value, type })
    
    if (!existingToken) {
        throw new NotFoundError()
    }
    
    // Check whether token has been expired
    if (new Date(existingToken.expiresAt) < new Date()) {
        throw new TokenExpiredError()
    }

    // We can safely delete these params
    delete req.query.token
    delete req.query.type

    // add:
    // - 'id' of the corresponding 'user'
    const userId = new Types.ObjectId(existingToken.user.id).toString()    // To prevent CastError by mongoose
    req.tokenizedUser! = {
        id: userId,
        // Skipping 'tokenId'
        // tokenId: existingToken.id
    }

    next()
}
