import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { validateRequest, BadRequestError } from '@chato-zombilet/common'
import { User } from '../models/user'

import { signUserIn } from '../services/jwt'

import { natsWrapper } from '../nats-wrapper'
import { UserSignedUpPublisher } from '../events/publishers/user-signed-up-publisher'

const router = express.Router()

router.post(
    '/api/users/signup',
    [
        body('email').isEmail().withMessage('E-mail must be valid.'),
        body('password')
            .trim()
            .isLength({ min: 8, max: 20 })
            .withMessage('Password must be between 8 and 20 characters.'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new BadRequestError('E-mail in use!')
        }

        // Build the new user and save it to the database
        const newUser = User.build({ email, password })
        await newUser.save()

        // Sign user in
        signUserIn(req, newUser)

        // Publish an event saying that a user is signed up
        await new UserSignedUpPublisher(natsWrapper.client).publish({
            id: newUser.id,
            email: newUser.email,
            version: newUser.version,
        })

        // Least info within response
        res.status(201).send({
            email: newUser.email,
        })
    }
)

export { router as signUpRouter }
