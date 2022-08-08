import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketCreatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

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

        console.log('TICKET CREATED: ', eventData)

        // new SendEmailForTicketCreated(email, eventData)

        msg.ack()
    }
}
