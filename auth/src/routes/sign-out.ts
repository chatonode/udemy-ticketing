import express, { Request, Response } from 'express'

import { signUserOut } from '../services/jwt'

const router = express.Router()

router.post('/api/users/signout', (req: Request, res: Response) => {
    // Sign user out
    signUserOut(req)

    res.send({})
})

export { router as signOutRouter }
