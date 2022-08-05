import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedUpEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Sender
import { SendEmailForUserSignedUp } from '../../services/email/sendgrid/sender/user-signed-up'

export class UserSignedUpListener extends Listener<UserSignedUpEvent> {
    readonly subject = Subjects.UserSignedUp
    queueGroupName = queueGroupName

    async onMessage(data: UserSignedUpEvent['data'], msg: Message): Promise<void> {
        const { email } = data

        new SendEmailForUserSignedUp(email)

        msg.ack()
    }
}
