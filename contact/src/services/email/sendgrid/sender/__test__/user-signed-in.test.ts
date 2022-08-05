// Fake Import
import sgMail from '@sendgrid/mail'

import { SendEmailForUserSignedIn } from '../user-signed-in'

it('sends sign-in email', () => {
    new SendEmailForUserSignedIn('existinguser@zombilet.com')

    expect(sgMail.send).toHaveBeenCalled()
    expect(sgMail.send).toHaveBeenCalledTimes(1)
    expect(sgMail.send).toBeCalledWith(
        expect.objectContaining({
            to: 'existinguser@zombilet.com',
            from: 'somevalidtestemail@sendgrid.com',    // Assigned from 'tests/setup.ts'
            subject: expect.any(String),
            text: expect.any(String)
        })
    )
})
