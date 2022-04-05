import { Publisher, Subjects, TicketUpdatedEvent } from '@chato-zombilet/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    public readonly subject = Subjects.TicketUpdated
}
