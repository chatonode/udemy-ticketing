import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedUpEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { User } from '../../models/user'

// Sender
import { SendEmailForUserSignedUp } from '../../services/email/sendgrid/sender/user-signed-up'

export class UserSignedUpListener extends Listener<UserSignedUpEvent> {
    readonly subject = Subjects.UserSignedUp
    queueGroupName = queueGroupName

    async onMessage(eventData: UserSignedUpEvent['data'], msg: Message): Promise<void> {
        // const { id, email } = eventData

        // const createdUser = User.build({
        //     id,
        //     email
        // })
        // await createdUser.save()

        // new SendEmailForUserSignedUp(email, eventData)

        msg.ack()
    }
}
