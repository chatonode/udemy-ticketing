import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { getExistingUserWithVersion } from '../../services/user/get-existing-user'

// Sender
import { SendEmailForUserSignedIn } from '../../services/email/sendgrid/sender/user-signed-in'

export class UserSignedInListener extends Listener<UserSignedInEvent> {
    readonly subject = Subjects.UserSignedIn
    queueGroupName = queueGroupName

    async onMessage(eventData: UserSignedInEvent['data'], msg: Message): Promise<void> {
        const { id: userId, version: userVersion } = eventData

        // No need to apply in OCC Filtering
        // // This listener does not update the user, just reads it anyway.
        // Get existing user | Error
        const existingUser = await getExistingUserWithVersion(userId, userVersion)
        
        new SendEmailForUserSignedIn(existingUser.email, {
            userId
        })

        msg.ack()
    }
}
