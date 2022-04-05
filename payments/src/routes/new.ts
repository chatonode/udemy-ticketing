import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { stripe } from '../stripe'

import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@chato-zombilet/common'
import { Order, OrderStatus } from '../models/order'
import { Payment } from '../models/payment'

import { natsWrapper } from '../nats-wrapper'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'

const router = express.Router()

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty().withMessage('token is required.'),
        body('orderId').not().isEmpty().withMessage('orderId is required.'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body

        const userId = req.currentUser!.id // as string

        // Find order the user is trying to pay for
        const order = await Order.findById(orderId)
        if(!order) {
            throw new NotFoundError()
        }

        // Make sure the order belongs to this user
        if(order.userId !== userId) {
            throw new NotAuthorizedError()
        }

        // Make sure it is still in the created state, instead of cancelled state
        const statusOfOrder = order.status
        if(statusOfOrder === OrderStatus.Cancelled) {
            throw new BadRequestError('This order cannot be paid.')
        }

        const charge = await stripe.charges.create({
            amount: order.price * 100,  // From cents to dollar
            currency: 'gbp',
            source: token,
        })

        // Make sure the payment amount matches the amount due for the order
        // if(order.price) {
        //    // bla bla
        // }

        // Verify payment with Stripe API

        // Build the payment and save it to the database
        const payment = Payment.build({
            orderId: order.id,
            stripeId: charge.id
        })
        await payment.save()

        // Publish an event saying that a payment was created
        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            version: payment.version,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        })

        res.status(201).send({ id: payment.id })
    }
)

export { router as createChargeRouter }
