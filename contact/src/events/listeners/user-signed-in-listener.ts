import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Sender
import { SendEmailForUserSignedIn } from '../../services/email/sendgrid/sender/user-signed-in'

export class UserSignedInListener extends Listener<UserSignedInEvent> {
    readonly subject = Subjects.UserSignedIn
    queueGroupName = queueGroupName

    async onMessage(eventData: UserSignedInEvent['data'], msg: Message): Promise<void> {
        const { email } = eventData

        new SendEmailForUserSignedIn(email, eventData)

        msg.ack()
    }
}