import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { validateRequest, NotFoundError, TokenExpiredError, TokenType } from '@chato-zombilet/common'
import { Token } from '../models/token'

const router = express.Router()

router.post(
    '/api/users/validate-token',
    [
        body('token').not().isEmpty().withMessage('Token must be provided.'),
        body('type')
            .not()
            .isEmpty()
            .withMessage('Token type must be provided.')
            // @ref-link: https://stackoverflow.com/questions/63753808/how-to-check-the-type-is-enum-or-not-in-typescript
            .custom((input: string) => (Object.values(TokenType) as string[]).includes(input))
            .withMessage('Token type must be valid.')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, type } = req.body

        // Hash incoming token
        const value = Token.toHash(token)

        // Fetch the token
        const existingToken = await Token.findOne({ value, type })

        if (!existingToken) {
            throw new NotFoundError()
        }

        // Check whether token has been expired
        if (new Date(existingToken.expiresAt) < new Date()) {
            throw new TokenExpiredError()
        }

        // Send response
        res.status(200).send()
    }
)

export { router as validateTokenRouter }
