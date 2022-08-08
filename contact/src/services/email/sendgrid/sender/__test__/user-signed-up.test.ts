// Fake Import
import sgMail from '@sendgrid/mail'

import { UserSignedUpInt } from '../../interface/user-signed-up-int'

import { SendEmailForUserSignedUp } from '../user-signed-up'

const getEventData = () => {
    const eventData: UserSignedUpInt['eventData'] =  {
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
            from: 'somevalidtestemail@sendgrid.com',    // Assigned from 'tests/setup.ts'
            subject: expect.any(String),
            text: expect.any(String)
        })
    )
})
