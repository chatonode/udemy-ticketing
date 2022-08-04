import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Templates
// import sgMail from '@sendgrid/mail'

export class UserSignedInListener extends Listener<UserSignedInEvent> {
    readonly subject = Subjects.UserSignedIn
    queueGroupName = queueGroupName

    async onMessage(data: UserSignedInEvent['data'], msg: Message): Promise<void> {
        const { email } = data

        console.log('Sign In > I AM GOING TO USE THAT E-MAIL AS: ' + email)

        // new SendEmailForUserSignedIn(email)

        // const message = {
        //     to: email,
        //     from: process.env.SENDGRID_EMAIL!,
        //     subject: 'ASDDDASDSADTITLE WELCOME AGAIN',
        //     text: 'YOU LL LIKE THAT BODY',
        // }
        // sgMail.send(message)

        msg.ack()
    }
}