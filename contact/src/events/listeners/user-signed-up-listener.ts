import { Message } from 'node-nats-streaming'

import { Listener, Subjects, UserSignedUpEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

// Template
import { SendEmailForUserSignedUp } from '../../services/email/sendgrid/sender/user-signed-up'

// import sgMail from '@sendgrid/mail'

export class UserSignedUpListener extends Listener<UserSignedUpEvent> {
    readonly subject = Subjects.UserSignedUp
    queueGroupName = queueGroupName

    async onMessage(data: UserSignedUpEvent['data'], msg: Message): Promise<void> {
        const { email } = data

        console.log('Sign Up > I AM GOING TO USE THAT E-MAIL AS: ' + email)

        new SendEmailForUserSignedUp(email)

        // const message = {
        //     to: email,
        //     from: process.env.SENDGRID_EMAIL!,
        //     subject: 'ASDDDASDSADTITLE WELCOME',
        //     text: 'YOU LL LIKE THAT BODY',
        // }
        // sgMail.send(message)


        msg.ack()
    }
}
