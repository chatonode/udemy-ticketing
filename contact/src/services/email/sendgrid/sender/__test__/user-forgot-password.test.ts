// Fake Import
import sgMail from '@sendgrid/mail'

import { TokenType } from '@chato-zombilet/common'

import { UserForgotPasswordInt } from '../../interface/user-forgot-password-int'

import { SendEmailForUserForgotPassword } from '../user-forgot-password'

// Helpers
import { getValidObjectId } from '../../../../../test/valid-id-generator'
import { addHoursToDate } from '../../../../../events/listeners/__test__/helpers/date'

const getEventData = () => {
    const eventData: UserForgotPasswordInt['eventData'] =  {
        userId: getValidObjectId(),
        tokenType: TokenType.ForgotPassword,
        tokenValue: 'sOmErAnDomStr1n6G',
        tokenExpiresAt: addHoursToDate(new Date(), 1).toISOString(),
    }

    return eventData
}

it('sends forgot password email', () => {
    new SendEmailForUserForgotPassword('existinguser@zombilet.com', getEventData())

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
