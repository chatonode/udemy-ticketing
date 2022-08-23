import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCancelledEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { getExistingUser } from './helpers/get-existing-user'

import { SendEmailForOrderCancelled } from '../../services/email/sendgrid/sender/order-cancelled'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
    queueGroupName = queueGroupName
    
    async onMessage(eventData: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        const {
            userId,
            id: orderId,
            status: orderStatus
        } = eventData

        // Get existing user | Error
        const existingUser = await getExistingUser(userId)

        new SendEmailForOrderCancelled(existingUser.email, {
            userId,
            orderId,
            orderStatus
        })

        msg.ack()
    }
}
