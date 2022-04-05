import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCancelledEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { Ticket } from '../../models/ticket'

// Event Publisher
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        const { ticket } = data

        // Find the ticket that the order is unreserving
        const existingTicket = await Ticket.findById(ticket.id)

        // If no ticket, throw error
        if (!existingTicket) {
            // TODO: Better Error Handling Implementation
            throw new Error('Ticket not found')
        }

        // Mark the ticket as being 'unreserved' by deleting its 'orderId' property
        existingTicket.set({ orderId: undefined })  // Default Value of TS Optional(?) Arguments

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
