import sgMail, { MailDataRequired } from '@sendgrid/mail'

import { ForbiddenError } from '@chato-zombilet/common'

import { BaseSender } from '../../base/base-sender'

export abstract class Sender<T extends BaseSender> {

    protected abstract sendingReason: T['sendingReason']
    protected abstract data: T['data']
    
    protected abstract getData: (eventData: T['eventData']) => T['data']

    protected sendEmailTo(email: string): void {
        const { title, body } = this.data

        const msg: MailDataRequired = {
            to: email,
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

    constructor() {
        
    }
}

