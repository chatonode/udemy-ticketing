import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCreatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { getExistingUser } from './helper/get-existing-user'

// import { SendEmailForOrderCreated } from '../../services/email/sendgrid/sender/order-created'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(eventData: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const {
            id: orderId,
            status: orderStatus,
            userId,
            expiresAt: orderExpiresAt,
            ticket: {
                id: ticketId,
                price: ticketPrice
            }
        } = eventData

        // Get existing user | Error
        const existingUser = await getExistingUser(userId)

        // new SendEmailForOrderCreated(existingUser.email, {
        //     userId,
        //     ticketId,
        //     ticketPrice,
        //     orderId,
        //     orderStatus,
        //     orderExpiresAt
        // })

        msg.ack()
    }
}
