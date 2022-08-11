// Fake Import
import sgMail from '@sendgrid/mail'

import { TicketUpdatedInt } from '../../interface/ticket-updated-int'

import { SendEmailForTicketUpdated } from '../ticket-updated'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'

const getEventData = () => {
    const eventData: TicketUpdatedInt['eventData'] =  {
        userId: getValidObjectId(),
        ticketId: getValidObjectId(),
        ticketTitle: '2. Traditional Ashalamu Alaykum Brothers Concert',
        ticketPrice: 99,
        orderId: getValidObjectId()
    }

    return eventData
}

it('sends sign-up email', () => {
    new SendEmailForTicketUpdated('existinguser@zombilet.com', getEventData())

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
