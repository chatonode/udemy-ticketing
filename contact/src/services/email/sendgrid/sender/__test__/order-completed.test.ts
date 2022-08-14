// Fake Import
import sgMail from '@sendgrid/mail'

import { OrderStatus } from '@chato-zombilet/common'

import { OrderCompletedInt } from '../../interface/order-completed-int'

import { SendEmailForOrderCompleted } from '../order-completed'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'

const getEventData = () => {
    const eventData: OrderCompletedInt['eventData'] =  {
        userId: getValidObjectId(),
        orderId: getValidObjectId(),
        orderStatus: OrderStatus.Completed,
    }

    return eventData
}

it('sends order completed email', () => {
    new SendEmailForOrderCompleted('existinguser@zombilet.com', getEventData())

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
