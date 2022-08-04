import sgMail from '@sendgrid/mail'

import { TempSubjects } from '../subjects'

export interface EmailData {
    title: string,
    body: string,
}

interface BaseTemp {
    tempSubject: TempSubjects
    data: EmailData
}

interface SGEmailTemp {
    to: string,
    from: string,
    subject: string,
    text: string,
}

export abstract class Temp<T extends BaseTemp> {
    protected abstract tempSubject: T['tempSubject']

    constructor(private email: string, protected data: T['data']) {
        this.sendEmail(data)
    }

    async sendEmail(data: T['data']): Promise<void> {
        const { title, body } = data

        console.log(title, body)

        console.log('TO: ', this.email, ' FROM: ', process.env.SENDGRID_EMAIL )
    
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
        }
    }
}

