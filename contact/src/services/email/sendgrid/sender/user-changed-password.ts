import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { UserChangedPasswordInt } from '../interface/user-changed-password-int'

export class SendEmailForUserChangedPassword extends Sender<UserChangedPasswordInt> {
    protected readonly sendingReason = SendingReasons.UserChangedPassword
    protected data: UserChangedPasswordInt['data']

    protected getData = (eventData: UserChangedPasswordInt['eventData']): UserChangedPasswordInt['data'] => {
        const titleUserChangedPassword = `Changed Password | Zombilet`
        const bodyUserChangedPassword = `
                                        Password has been changed of your account linked to your user ID as ${eventData.userId}.
            
                                        If this is not you, please contact us immediately at help@zombilet.com.

                                    `

        const data = {
            title: titleUserChangedPassword,
            body: bodyUserChangedPassword,
        }

        return data
    }

    constructor(email: string, eventData: UserChangedPasswordInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
