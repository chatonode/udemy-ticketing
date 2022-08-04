import sgMail from '@sendgrid/mail'

import { ForbiddenError } from '@chato-zombilet/common'

import { BaseSender } from '../../base/base-sender'


interface SGEmailTemp {
    to: string,
    from: string,
    subject: string,
    text: string,
}

export abstract class Sender<T extends BaseSender> {
    protected abstract sendingReason: T['sendingReason']

    constructor(private email: string, protected data: T['data']) {
        this.sendEmail(data)
    }

    async sendEmail(data: T['data']): Promise<void> {
        const { title, body } = data

        const msg: SGEmailTemp = {
            to: this.email,
            from: process.env.SENDGRID_EMAIL!,
            subject: title,
            text: body,
        }

        try {
            await sgMail.send(msg)
        } catch (error) {
            console.error(error)
            console.error((error as any).response)

            throw new ForbiddenError()
        }
    }
}

