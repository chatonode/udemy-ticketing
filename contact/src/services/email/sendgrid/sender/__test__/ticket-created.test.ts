// Fake Import
import sgMail from '@sendgrid/mail'

import { TicketCreatedInt } from '../../interface/ticket-created-int'

import { SendEmailForTicketCreated } from '../ticket-created'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'

const getEventData = () => {
    const eventData: TicketCreatedInt['eventData'] =  {
        userId: getValidObjectId(),
        ticketId: getValidObjectId(),
        ticketTitle: 'Ashalamu Alaykum Brothers Concert',
        ticketPrice: 99
    }

    return eventData
}

it('sends sign-up email', () => {
    new SendEmailForTicketCreated('existinguser@zombilet.com', getEventData())

    expect(sgMail.send).toHaveBeenCalled()
    expect(sgMail.send).toHaveBeenCalledTimes(1)
    expect(sgMail.send).toBeCalledWith(
        expect.objectContaining({
            to: 'existinguser@zombilet.com',
            from: process.env.SENDGRID_EMAIL,    // Assigned from 'tests/setup.ts'
            subject: expect.any(String),
            text: expect.any(String)
        })
    )
})
