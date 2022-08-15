import express, { Request, Response } from 'express'
import { param } from 'express-validator'

import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@chato-zombilet/common'

import mongoose from 'mongoose'
import { Order, OrderStatus } from '../models/order'

import { natsWrapper } from '../nats-wrapper'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'

const router = express.Router()

router.delete(
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

        const order = await Order.findById(orderId).populate('ticket')  // to be able to use: order.ticket.id

        if(!order) {
            throw new NotFoundError()
        }

        if(order.userId !== userId) {
            throw new NotAuthorizedError()
        }

        order.status = OrderStatus.Cancelled
        await order.save()

        // Publish an event saying that an order was cancelled
        await new OrderCancelledPublisher(natsWrapper.client).publish({
            userId: order.userId,
            id: order.id,
            version: order.version,
            status: order.status,
            ticket: {
                id: order.ticket.id
            }
        })

        res.status(204).send(order)
    }
)

export { router as cancelOrderRouter }
