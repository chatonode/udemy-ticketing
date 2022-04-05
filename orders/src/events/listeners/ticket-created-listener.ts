import { Message } from "node-nats-streaming";

import { Listener, Subjects, TicketCreatedEvent } from "@chato-zombilet/common";

import { queueGroupName } from "./queue-group-name";

import { Ticket } from '../../models/ticket'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
    queueGroupName = queueGroupName

    async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
        const { id, title, price } = data

        const createdTicket = Ticket.build({
            id,
            title,
            price
        })
        await createdTicket.save()

        msg.ack()
    }
}
