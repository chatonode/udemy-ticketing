// Fake Import
import sgMail from '@sendgrid/mail'

import { OrderStatus } from '@chato-zombilet/common'

import { OrderCreatedInt } from '../../interface/order-created-int'

import { SendEmailForOrderCreated } from '../order-created'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'
import { getExpiresAt } from '../../../../../test/expires-at-generator'

const getEventData = () => {
    const eventData: OrderCreatedInt['eventData'] =  {
        userId: getValidObjectId(),
        orderId: getValidObjectId(),
        orderStatus: OrderStatus.Created,
        orderExpiresAt: getExpiresAt(10),
        ticketId: getValidObjectId(),
        ticketPrice: 29
    }

    return eventData
}

it('sends order created email', () => {
    new SendEmailForOrderCreated('existinguser@zombilet.com', getEventData())

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
