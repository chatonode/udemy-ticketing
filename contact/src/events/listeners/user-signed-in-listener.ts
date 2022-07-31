import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class UserSignedInListener extends Listener<UserSignedInEvent> {
    readonly subject = Subjects.UserSignedIn
    queueGroupName = queueGroupName

    async onMessage(data: UserSignedInEvent['data'], msg: Message): Promise<void> {
        const { email } = data

        console.log('Sign In > I AM GOING TO USE THAT E-MAIL AS: ' + email)

        msg.ack()
    }
}