import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketUpdatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { User } from '../../models/user'

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

        // Fetch user
        const existingUser = await User.findById(userId)
        if(!existingUser) {
            // TODO: Better Error Handling Implementation
            throw new Error('User not found')
        }

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
