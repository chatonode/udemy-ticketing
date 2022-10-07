import express, { Request, Response } from 'express'

import { validateRequest } from '@chato-zombilet/common'
import { tokenRequestRules, validateToken } from '../middlewares/validate-token'

// import { User } from '../models/user'

const router = express.Router()

// Upper and more generic 'validate-token' router layer that uses 'validateToken' middleware
// // For details of logic of token validation; check 'validateToken' middleware
router.post(
    '/api/users/validate-token',
    tokenRequestRules(),
    validateRequest,
    validateToken,
    async (req: Request, res: Response) => {
        // Skipping for preventing to much DB requests
        // Middleware is already checking token itself
        // const userId = req.tokenizedUser!.id
        // // Fetch the user
        // // ...


        // Send response
        res.status(200).send()
    }
)

export { router as validateTokenRouter }
