// Fake Import
import sgMail from '@sendgrid/mail'

import { SendEmailForUserSignedUp } from '../user-signed-up'

it('sends email', () => {
    new SendEmailForUserSignedUp('newuser@zombilet.com')

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
