import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserForgotPasswordEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { getExistingUser } from '../../services/user/get-existing-user'

import { SendEmailForUserForgotPassword } from '../../services/email/sendgrid/sender/user-forgot-password'

export class UserForgotPasswordListener extends Listener<UserForgotPasswordEvent> {
    readonly subject = Subjects.UserForgotPassword
    queueGroupName = queueGroupName

    async onMessage(eventData: UserForgotPasswordEvent['data'], msg: Message): Promise<void> {
        const {
            id: userId,
            version: userVersion,
            token: {
                value: tokenValue,
                type: tokenType,
                expiresAt: tokenExpiresAt
            }

        } = eventData

        // Get existing user | Error
        const existingUser = await getExistingUser(userId)

        new SendEmailForUserForgotPassword(existingUser.email, {
            userId,
            tokenValue,
            tokenType,
            tokenExpiresAt
        })

        msg.ack()
    }
}
