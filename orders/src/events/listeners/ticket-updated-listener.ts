import { Message } from "node-nats-streaming";

import { Listener, Subjects, TicketUpdatedEvent } from "@chato-zombilet/common";

import { queueGroupName } from "./queue-group-name";

import { Ticket } from '../../models/ticket'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
        const { id, title, price, version } = data

        // Applying in OCC Filtering
        const ticket = await Ticket.findPreviousVersion({
            id,
            version
        })

        if(!ticket) {
            // TODO: Better Error Handling Implementation
            throw new Error('Ticket not found')
        }

        // Updating the Ticket
        ticket.set({
            title,
            price,
            // version NOT NEEDED: Plugin automatically increments the 'version' in '.save()'
        })
        await ticket.save()

        msg.ack()
    }
}
