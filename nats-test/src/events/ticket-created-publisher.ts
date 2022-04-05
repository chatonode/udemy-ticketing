import { Publisher } from './base-publisher'
import { TicketCreatedEvent } from './ticket-created-event'
import { Subjects } from './subjects'

// Publisher Sub-Class
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    public readonly subject = Subjects.TicketCreated
}
