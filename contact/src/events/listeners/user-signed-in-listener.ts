import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { User } from '../../models/user'

// Sender
import { SendEmailForUserSignedIn } from '../../services/email/sendgrid/sender/user-signed-in'

export class UserSignedInListener extends Listener<UserSignedInEvent> {
    readonly subject = Subjects.UserSignedIn
    queueGroupName = queueGroupName

    async onMessage(eventData: UserSignedInEvent['data'], msg: Message): Promise<void> {
        const { id: userId, version } = eventData

        // No need to apply in OCC Filtering
        // // This listener does not update the user, just reads it anyway.
        const existingUser = await User.findById(userId)
        
        if(!existingUser) {
            // TODO: Better Error Handling Implementation
            throw new Error('User not found')
        }

        new SendEmailForUserSignedIn(existingUser.email, {
            userId
        })

        msg.ack()
    }
}
