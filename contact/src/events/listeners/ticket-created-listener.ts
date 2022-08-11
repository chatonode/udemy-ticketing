import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketCreatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { User } from '../../models/user'

import { SendEmailForTicketCreated } from '../../services/email/sendgrid/sender/ticket-created'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
    queueGroupName = queueGroupName

    async onMessage(eventData: TicketCreatedEvent['data'], msg: Message): Promise<void> {
        const {
            id: ticketId,
            title: ticketTitle,
            price: ticketPrice,
            userId
        } = eventData

        // Fetch user
        const existingUser = await User.findById(userId)
        if(!existingUser) {
            // TODO: Better Error Handling Implementation
            throw new Error('User not found')
        }

        new SendEmailForTicketCreated(existingUser.email, {
            userId,
            ticketId,
            ticketTitle,
            ticketPrice
        })

        msg.ack()
    }
}
