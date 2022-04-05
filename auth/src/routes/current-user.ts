import express, { Request, Response } from 'express'

import { currentUser } from '@chato-zombilet/common'

const router = express.Router()

router.get('/api/users/currentuser', currentUser, (req: Request, res: Response) => {
    res.send({ currentUser: req.currentUser || null })      // Send 'null' instead of 'undefined'
})


export { router as currentUserRouter }