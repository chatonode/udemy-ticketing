import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface TicketCreatedEventData extends EventData {
    userId: string
    ticketId: string
    ticketTitle: string
    ticketPrice: number
}

export interface TicketCreatedInt {
    sendingReason: SendingReasons.TicketCreated
    data: EmailData
    eventData: TicketCreatedEventData
}
