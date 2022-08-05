import { SendingReasons } from '../../base/sending-reasons'

import { UserSignedInInt } from '../interface/user-signed-in-int'

import { Sender } from './sender'

const titleSignIn = 'Sign In Activity | Zombilet!'
const bodySignIn = `
                    There is a Sign-In activity within your account.

                    If this is not you, please contact us immediately at help@zombilet.com.
                    `

const data = {
    title: titleSignIn,
    body: bodySignIn
}

export class SendEmailForUserSignedIn extends Sender<UserSignedInInt> {
    protected readonly sendingReason = SendingReasons.UserSignedIn
    data = data

    constructor(email: string) {
        super(email, data)
    }
}
