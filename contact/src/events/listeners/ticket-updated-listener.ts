import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketUpdatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(eventData: TicketUpdatedEvent['data'],msg: Message): Promise<void> {
        const {
            id: ticketId,
            title: ticketTitle,
            price: ticketPrice,
            userId,
            orderId,
        } = eventData

        console.log('TICKET UPDATED: ', eventData)

        msg.ack()
    }
}
