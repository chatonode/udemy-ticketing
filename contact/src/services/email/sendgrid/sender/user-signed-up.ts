import { SendingReasons } from '../../base/sending-reasons'

import { Sender } from './sender'
import { UserSignedUpInt } from '../interface/user-signed-up-int'

const titleWelcome = 'Welcome to Zombilet!'
const bodyWelcome = `We are going to love each other more starting from this day!`

const data = {
    title: titleWelcome,
    body: bodyWelcome
}

export class SendEmailForUserSignedUp extends Sender<UserSignedUpInt> {
    protected readonly sendingReason = SendingReasons.UserSignedUp
    data = data

    constructor(email: string) {
        super(email, data)
    }
}
