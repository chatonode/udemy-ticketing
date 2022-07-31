import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedUpEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class UserSignedUpListener extends Listener<UserSignedUpEvent> {
    readonly subject = Subjects.UserSignedUp
    queueGroupName = queueGroupName

    async onMessage(data: UserSignedUpEvent['data'], msg: Message): Promise<void> {
        const { email } = data

        console.log('Sign Up > I AM GOING TO USE THAT E-MAIL AS: ' + email)

        msg.ack()
    }
}
