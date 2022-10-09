import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { validateRequest, NotAuthorizedError } from '@chato-zombilet/common'

import { tokenRequestRules, validateToken } from '../middlewares/validate-token'
import { User } from '../models/user'
import { Token } from '../models/token'

import { signUserOut } from '../services/jwt'

import { natsWrapper } from '../nats-wrapper'
import { UserChangedPasswordPublisher } from '../events/publishers/user-changed-password-publisher'

const router = express.Router()

router.post(
    '/api/users/reset-password',
    tokenRequestRules(),
    validateRequest,
    validateToken,
    [
        body('newPassword')
            .trim()
            .isLength({ min: 8, max: 20 })
            .withMessage('Password must be between 8 and 20 characters.'),
        body('repeatedNewPassword')
            .not()
            .isEmpty()
            .withMessage('Repeated password must exist to confirm new password.')
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage('Passwords must match.'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { newPassword } = req.body
        const userId = req.tokenizedUser!.id

        // Fetch the user
        const existingUser = await User.findById(userId)
        if(!existingUser) {
            // TODO: Better Error Handling Implementation
            throw new NotAuthorizedError()
        }

        // Update the password
        existingUser.set({
            password: newPassword
        })
        await existingUser.save()   // Auto-increments 'version'

        // Delete all the tokens that user has
        // - Not just 'ForgotPassword' types
        await Token.deleteMany({
            user: existingUser.id
        })

        // Sign user out
        signUserOut(req)    // Now only signs out current session if user is logged-in. Better implementation option is as below: 
        //                      // Need to reach all the clients:
        //                      // to invalidate all 'currentUser' token inside jwt payload(with versioning and/or refresh/access token)
        //                  // Then, we do not need to sign user out from here.

        // Publish an event saying that a user is signed up
        await new UserChangedPasswordPublisher(natsWrapper.client).publish({
            id: existingUser.id,
            version: existingUser.version
        })

        res.status(200).send()
    }
)

export { router as resetPasswordRouter }
