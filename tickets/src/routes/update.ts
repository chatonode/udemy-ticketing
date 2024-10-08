import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError,
    BadRequestError
} from '@chato-zombilet/common'
import { Ticket } from '../models/ticket'

import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put(
    '/api/tickets/:id',
    requireAuth, // currentUser! can be used
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required.'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be decimal greater than 0.'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const id = req.params.id
        const ticket = await Ticket.findById(id)

        if (!ticket) {
            throw new NotFoundError()
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError()
        }

        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket.')
        }

        // Update
        ticket.set({
            title: req.body.title,
            price: req.body.price
        })
        await ticket.save()

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        })

        res.status(200).send(ticket)
    }
)

export { router as updateTicketRouter }
