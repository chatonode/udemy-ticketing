import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Sender
import { SendEmailForUserSignedIn } from '../../services/email/sendgrid/sender/user-signed-in'

export class UserSignedInListener extends Listener<UserSignedInEvent> {
    readonly subject = Subjects.UserSignedIn
    queueGroupName = queueGroupName

    async onMessage(data: UserSignedInEvent['data'], msg: Message): Promise<void> {
        const { email } = data

        new SendEmailForUserSignedIn(email)

        msg.ack()
    }
}