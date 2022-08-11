import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { TicketUpdatedInt } from '../interface/ticket-updated-int'

export class SendEmailForTicketUpdated extends Sender<TicketUpdatedInt> {
    protected readonly sendingReason = SendingReasons.TicketUpdated
    protected data: TicketUpdatedInt['data']

    protected getData = (eventData: TicketUpdatedInt['eventData']): TicketUpdatedInt['data'] => {
        const titleTicketUpdated = `Ticket Updated | Zombilet`
        const bodyTicketUpdated = `
                                        Hi there! We have some news related to you:

                                        A ticket has been updated with your account. You can see the details listed as below:

                                        - Owner ID: ${eventData.userId}
                                        - Ticket ID: ${eventData.ticketId}
                                        - Ticket Title: ${eventData.ticketTitle}
                                        - Ticket Price: ${eventData.ticketPrice}
                                        - Ordered: ${!!eventData.orderId}
                                        ${!!eventData.orderId ? '- Order ID: ' + eventData.orderId : '\n'}
            
                                        If this ticket does not belong to you, please contact us immediately at help@zombilet.com.

                                    `

        const data = {
            title: titleTicketUpdated,
            body: bodyTicketUpdated,
        }

        return data
    }

    constructor(email: string, eventData: TicketUpdatedInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
