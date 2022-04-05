import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCreatedEvent, NotFoundError } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { Ticket } from '../../models/ticket'

// Event Publisher
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const { id, ticket } = data

        // Find the ticket that the order is reserving
        const existingTicket = await Ticket.findById(ticket.id)

        // If no ticket, throw error
        if(!existingTicket) {
            // TODO: Better Error Handling Implementation
            throw new Error('Ticket not found')
        }

        // Mark the ticket as being 'reserved' by setting its 'orderId' property
        existingTicket.set({ orderId: id })

        // Save the ticket
        await existingTicket.save()

        // Emit a `ticket-updated` event
        await new TicketUpdatedPublisher(this.client).publish({
            id: existingTicket.id,
            version: existingTicket.version,
            title: existingTicket.title,
            price: existingTicket.price,
            userId: existingTicket.userId,
            orderId: existingTicket.orderId
        })

        // ack the message
        msg.ack()
    }
}
