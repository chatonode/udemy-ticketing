import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { UserSignedInInt } from '../interface/user-signed-in-int'

export class SendEmailForUserSignedIn extends Sender<UserSignedInInt> {
    protected readonly sendingReason = SendingReasons.UserSignedIn
    protected data: UserSignedInInt['data']

    protected getData = (eventData: UserSignedInInt['eventData']): UserSignedInInt['data'] => {
        const titleSignIn = 'Sign In Activity | Zombilet!'
        const bodySignIn = `
                                There is a Sign-In activity within your account linked to your user ID as ${eventData.userId}.
            
                                If this is not you, please contact us immediately at help@zombilet.com.
                            `

        const data = {
            title: titleSignIn,
            body: bodySignIn,
        }

        return data
    }

    constructor(email: string, eventData: UserSignedInInt['eventData']) {
        super()

        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
