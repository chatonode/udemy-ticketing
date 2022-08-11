// Fake Import
import sgMail from '@sendgrid/mail'

import { UserSignedUpInt } from '../../interface/user-signed-up-int'

import { SendEmailForUserSignedUp } from '../user-signed-up'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'

const getEventData = () => {
    const eventData: UserSignedUpInt['eventData'] =  {
        userId: getValidObjectId(),
        email: 'newuser@zombilet.com'
    }

    return eventData
}

it('sends sign-up email', () => {
    new SendEmailForUserSignedUp('newuser@zombilet.com', getEventData())

    expect(sgMail.send).toHaveBeenCalled()
    expect(sgMail.send).toHaveBeenCalledTimes(1)
    expect(sgMail.send).toBeCalledWith(
        expect.objectContaining({
            to: 'newuser@zombilet.com',
            from: process.env.SENDGRID_EMAIL,    // Assigned from 'tests/setup.ts'
            subject: expect.any(String),
            text: expect.any(String)
        })
    )
})
