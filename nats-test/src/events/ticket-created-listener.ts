import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { TicketCreatedEvent } from './ticket-created-event'
import { Subjects } from './subjects'

// Listener Sub-Class
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    public readonly subject = Subjects.TicketCreated
    public queueGroupName = 'payments-service-queue-group'

    public onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        console.log('Event Data:', data)

        console.log(data.id)
        console.log(data.title)
        console.log(data.price)

        // It MUST be acknowledged for STAN, if all goes well.
        msg.ack()
    }
}
