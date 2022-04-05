import express, { Request, Response } from 'express'
import { param } from 'express-validator'

import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@chato-zombilet/common'

import mongoose from 'mongoose'
import { Order } from '../models/order'

const router = express.Router()

router.get(
    '/api/orders/:orderId',
    requireAuth,
    [
        param('orderId')
            // NOTE: Assuming that other services (we listen) use MongoDB
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('orderId must be valid.'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const userId = req.currentUser!.id
        const orderId = req.params.orderId
        
        const order = await Order.findById(orderId).populate('ticket')

        if(!order) {
            throw new NotFoundError()
        }

        if(order.userId !== userId) {
            throw new NotAuthorizedError()
        }

        res.status(200).send(order)
    }
)

export { router as showOrderRouter }
