import { Publisher, Subjects, TicketCreatedEvent } from '@chato-zombilet/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    public readonly subject = Subjects.TicketCreated
}
