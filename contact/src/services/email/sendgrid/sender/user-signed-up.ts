import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { UserSignedUpInt } from '../interface/user-signed-up-int'

export class SendEmailForUserSignedUp extends Sender<UserSignedUpInt> {
    protected readonly sendingReason = SendingReasons.UserSignedUp
    protected data: UserSignedUpInt['data']

    protected getData = (eventData: UserSignedUpInt['eventData']): UserSignedUpInt['data'] => {
        const titleWelcome = 'Welcome to Zombilet!'
        const bodyWelcome = `
                                We are going to love each other more starting from this day!

                                You can now log in within your e-mail address as: ${eventData.email}

                                Your User ID is: ${eventData.userId}
        
                            `

        const data = {
            title: titleWelcome,
            body: bodyWelcome,
        }

        return data
    }

    constructor(email: string, eventData: UserSignedUpInt['eventData']) {
        super()

        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
