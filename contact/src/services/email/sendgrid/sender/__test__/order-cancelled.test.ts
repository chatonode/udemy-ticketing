// Fake Import
import sgMail from '@sendgrid/mail'

import { OrderStatus } from '@chato-zombilet/common'

import { OrderCancelledInt } from '../../interface/order-cancelled-int'

import { SendEmailForOrderCancelled } from '../order-cancelled'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'

const getEventData = () => {
    const eventData: OrderCancelledInt['eventData'] =  {
        userId: getValidObjectId(),
        orderId: getValidObjectId(),
        orderStatus: OrderStatus.Cancelled,
    }

    return eventData
}

it('sends order cancelled email', () => {
    new SendEmailForOrderCancelled('existinguser@zombilet.com', getEventData())

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
