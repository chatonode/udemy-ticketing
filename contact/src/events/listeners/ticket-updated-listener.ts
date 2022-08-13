import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketUpdatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { getExistingUser } from './helper/get-existing-user'

import { SendEmailForTicketUpdated } from '../../services/email/sendgrid/sender/ticket-updated'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(eventData: TicketUpdatedEvent['data'],msg: Message): Promise<void> {
        const {
            userId,
            id: ticketId,
            title: ticketTitle,
            price: ticketPrice,
            orderId,
        } = eventData

        // Get existing user | Error
        const existingUser = await getExistingUser(userId)

        new SendEmailForTicketUpdated(existingUser.email, {
            userId,
            ticketId,
            ticketTitle,
            ticketPrice,
            orderId
        })

        msg.ack()
    }
}
