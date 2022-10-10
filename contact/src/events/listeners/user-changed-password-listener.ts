import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserChangedPasswordEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Helpers
import { User } from '../../models/user'

import { SendEmailForUserChangedPassword } from '../../services/email/sendgrid/sender/user-changed-password'

export class UserChangedPasswordListener extends Listener<UserChangedPasswordEvent> {
    readonly subject = Subjects.UserChangedPassword
    queueGroupName = queueGroupName

    async onMessage(eventData: UserChangedPasswordEvent['data'], msg: Message): Promise<void> {
        const { id: userId, version: userVersion } = eventData

        // Applying in OCC Filtering
        const existingUser = await User.findPreviousVersion({
            id: userId,
            version: userVersion
        })

        if(!existingUser) {
            // TODO: Better Error Handling Implementation
            throw new Error('User not found')
        }

        // Updating the User (version)
        await existingUser.save()   // Plugin automatically increments the 'version' in '.save()'

        new SendEmailForUserChangedPassword(existingUser.email, {
            userId
        })

        msg.ack()
    }
}
