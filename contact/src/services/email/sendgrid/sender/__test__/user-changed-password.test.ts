// Fake Import
import sgMail from '@sendgrid/mail'

import { UserChangedPasswordInt } from '../../interface/user-changed-password-int'

import { SendEmailForUserChangedPassword } from '../user-changed-password'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'

const getEventData = () => {
    const eventData: UserChangedPasswordInt['eventData'] =  {
        userId: getValidObjectId()
    }

    return eventData
}

it('sends an email', () => {
    new SendEmailForUserChangedPassword('existinguser@zombilet.com', getEventData())

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
