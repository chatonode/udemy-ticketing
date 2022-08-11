import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface TicketUpdatedEventData extends EventData {
    userId: string;
    ticketId: string;
    ticketTitle: string;
    ticketPrice: number;
    orderId?: string;
}

export interface TicketUpdatedInt {
    sendingReason: SendingReasons.TicketUpdated
    data: EmailData
    eventData: TicketUpdatedEventData
}
