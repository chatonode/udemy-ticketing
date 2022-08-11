import { SendingReasons, EmailData } from '../../base/base-sender'

import { Sender } from './sender'
import { TicketCreatedInt } from '../interface/ticket-created-int'

export class SendEmailForTicketCreated extends Sender<TicketCreatedInt> {
    protected readonly sendingReason = SendingReasons.TicketCreated
    protected data: TicketCreatedInt['data']

    protected getData = (eventData: TicketCreatedInt['eventData']): TicketCreatedInt['data'] => {
        const titleTicketCreated = `Ticket Created | Zombilet`
        const bodyTicketCreated = `
                                        Hi ${eventData.userId}!

                                        A ticket has been created with your account. You can see the details listed as below:

                                        - Owner ID: ${eventData.userId}
                                        - Ticket ID: ${eventData.ticketId}
                                        - Ticket Title: ${eventData.ticketTitle}
                                        - Ticket Price: ${eventData.ticketPrice}
            
                                        If this ticket does not belong to you, please contact us immediately at help@zombilet.com.

                                    `

        const data = {
            title: titleTicketCreated,
            body: bodyTicketCreated,
        }

        return data
    }

    constructor(email: string, eventData: TicketCreatedInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
