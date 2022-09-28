import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { randomBytes } from 'crypto'

import { validateRequest } from '@chato-zombilet/common'
import { User } from '../models/user'
import { Token, TokenType } from '../models/token'

import { addHoursToDate } from '../helpers/date'

import { natsWrapper } from '../nats-wrapper'
import { UserForgotPasswordPublisher } from '../events/publishers/user-forgot-password-publisher'

const router = express.Router()

router.post(
  '/api/users/forgot-password',
  [
    body('email').isEmail().withMessage('E-mail must be valid.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body

    // Fetch the user
    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      // Don't throw an error and just 'response' and 'return'
      // // For giving least info against malicious attacks
      return res.status(200).send()
    }

    // Create a token
    const value = randomBytes(32).toString('hex')  // Enough length?
    const expiresAt = addHoursToDate(new Date(), 1)
    const token = Token.build({
        user: existingUser.id,
        value,
        type: TokenType.ForgotPassword,
        expiresAt
      })
      await token.save()
  
    // Publish an event saying that a user forgot password
    await new UserForgotPasswordPublisher(natsWrapper.client).publish({
      id: existingUser.id,
      tokenValue: value,  // Publishing plain token 'value', instead of hashed 'value' 
      tokenExpiresAt: token.expiresAt.toISOString(),
      version: existingUser.version
    })

    // Least info within response
    res.status(200).send()
  }
)

export { router as forgotPasswordRouter }
