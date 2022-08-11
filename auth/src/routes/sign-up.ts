import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest, BadRequestError } from '@chato-zombilet/common'
import { User } from '../models/user'

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
      .withMessage('Password must between 8 and 20 characters.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      throw new BadRequestError('E-mail in use!')
    }

    // Build the user and save it to the database
    const user = User.build({ email, password })
    await user.save()

    // Publish an event saying that a user is signed up
    await new UserSignedUpPublisher(natsWrapper.client).publish({
      id: user.id,
      email: user.email,
      version: user.version
    })

    // Generate a JWT
    const payload = {
      //TODO: error TS2322: Type 'String' is not assignable to type 'string'.
      id: user.id as string,  // - Defined as 'id?: any;' at Mongoose document
      email: user.email,
      // Maybe add 'version' too?
      // // For "Refresh Token / Access Token Mechanism" feature?
    }
    const secretKey = process.env.JWT_KEY!
    const userJwt = jwt.sign(payload, secretKey)

    // Store it on session object
    req.session = {
      jwt: userJwt,
    }

    // Least info within response
    res.status(201).send({
      email: user.email
    })
  }
)

export { router as signUpRouter }
