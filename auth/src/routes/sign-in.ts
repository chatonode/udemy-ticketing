import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { validateRequest, BadRequestError } from '@chato-zombilet/common'
import { User } from '../models/user'

import { signUserIn } from '../services/jwt'

import { Password } from '../services/password'

import { natsWrapper } from '../nats-wrapper'
import { UserSignedInPublisher } from '../events/publishers/user-signed-in-publisher'

const router = express.Router()

router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('E-mail must be valid.'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password must be supplied.'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            throw new BadRequestError('Invalid Credentials!')
        }

        // Password Check
        const passwordsMatch = await Password.compare(
            existingUser.password,
            password
        )

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid Credentials!')
        }

        // Sign user in
        signUserIn(req, existingUser)

        // Publish an event saying that a user is signed in
        await new UserSignedInPublisher(natsWrapper.client).publish({
            id: existingUser.id,
            version: existingUser.version,
        })

        // Least info within response
        res.status(200).send({
            email: existingUser.email,
        })
    }
)

export { router as signInRouter }
