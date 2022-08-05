import sgMail, { MailDataRequired } from '@sendgrid/mail'

import { ForbiddenError } from '@chato-zombilet/common'

import { BaseSender } from '../../base/base-sender'

export abstract class Sender<T extends BaseSender> {
    protected abstract sendingReason: T['sendingReason']

    constructor(private email: string, protected data: T['data']) {
        this.sendEmail(data)
    }

    sendEmail(data: T['data']): void {
        const { title, body } = data

        const msg: MailDataRequired = {
            to: this.email,
            from: process.env.SENDGRID_EMAIL!,
            subject: title,
            text: body,
        }

        try {
            sgMail.send(msg)
        } catch (error) {
            console.error(error)
            console.error((error as any).response)

            throw new ForbiddenError()
        }
    }
}

