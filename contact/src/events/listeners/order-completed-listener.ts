import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCompletedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { getExistingUser } from './helper/get-existing-user'

import { SendEmailForOrderCompleted } from '../../services/email/sendgrid/sender/order-completed'

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    readonly subject = Subjects.OrderCompleted
    queueGroupName = queueGroupName

    async onMessage(eventData: OrderCompletedEvent['data'], msg: Message): Promise<void> {
        const {
            userId,
            id: orderId,
            status: orderStatus
        } = eventData

        // Get existing user | Error
        const existingUser = await getExistingUser(userId)

        new SendEmailForOrderCompleted(existingUser.email, {
            userId,
            orderId,
            orderStatus
        })

        msg.ack()
    }
}
