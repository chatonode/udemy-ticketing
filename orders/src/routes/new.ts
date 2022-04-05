import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { requireAuth, validateRequest, NotFoundError, BadRequestError} from '@chato-zombilet/common'

import mongoose from 'mongoose'
import { Order, OrderStatus } from '../models/order'
import { Ticket } from '../models/ticket'

import { natsWrapper } from '../nats-wrapper'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60   // Test: 1 Minute    // Original: 15 Minutes

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .withMessage('ticketId is required.')
            // NOTE: Assuming that other services (we listen) use MongoDB
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('ticketId must be valid.')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            throw new NotFoundError()
        }

        // Make sure that this ticket is not already reserved
        const ticketIsReserved = await ticket.isReserved()
        if (ticketIsReserved) {
            throw new BadRequestError('Ticket has already been reserved.')
        }

        // Calculate an expiration date for this order
        const expirationDate = new Date()
        expirationDate.setSeconds(expirationDate.getSeconds() + EXPIRATION_WINDOW_SECONDS)

        // Build the order and save it to the database
        const userId = req.currentUser!.id
        const order = Order.build({
            userId,
            status: OrderStatus.Created,
            expiresAt: expirationDate,
            ticket
        })
        await order.save()

        // Publish an event saying that an order was created
        // TODO: await with some Rollback Mechanism
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),   // UTC Timestamp
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        })
        
        res.status(201).send(order)
    }
)

export { router as createOrderRouter }
