import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { validateRequest, NotFoundError, TokenExpiredError } from '@chato-zombilet/common'
import { Token } from '../models/token'

const router = express.Router()

router.post(
    '/api/users/validate-token',
    [
        body('token').exists().withMessage('Token must be provided.')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token } = req.body

        // Hash incoming token
        const value = Token.toHash(token)

        // Fetch the token
        const existingToken = await Token.findOne({ value })

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
