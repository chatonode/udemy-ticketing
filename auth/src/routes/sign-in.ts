import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest, BadRequestError } from '@chato-zombilet/common'
import { User } from '../models/user'

import { Password } from '../services/password'

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
    const passwordsMatch = await Password.compare(existingUser.password, password)

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials!')
    }

    // Generate a JWT
    const payload = {
      //TODO: error TS2322: Type 'String' is not assignable to type 'string'.
      id: existingUser.id as string,  // - Defined as 'id?: any;' at Mongoose document
      email: existingUser.email,
    }
    const secretKey = process.env.JWT_KEY!
    const userJwt = jwt.sign(payload, secretKey)

    // Store it on session object
    req.session = {
      jwt: userJwt,
    }

    res.status(200).send(existingUser)
  }
)

export { router as signInRouter }
