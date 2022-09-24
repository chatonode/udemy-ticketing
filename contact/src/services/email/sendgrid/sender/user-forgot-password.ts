import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { UserForgotPasswordInt } from '../interface/user-forgot-password-int'

export class SendEmailForUserForgotPassword extends Sender<UserForgotPasswordInt> {
    protected readonly sendingReason = SendingReasons.UserForgotPassword
    protected data: UserForgotPasswordInt['data']

    protected getData = (eventData: UserForgotPasswordInt['eventData']): UserForgotPasswordInt['data'] => {
        const titleUserForgotPassword = `Reset Password | Zombilet`
        const bodyUserForgotPassword = `
                                        Hi there! We have some news related to your account:

                                        -------------------------------------------------

                                        YES, I REQUESTED A PASSWORD RESET:

                                        No need to worry about forgetting your password. Everybody does!
                                        
                                        You can click the link below and reset your password:

                                        https://zombilet.dev/users/click?t=${eventData.tokenValue}

                                        - Owner ID: ${eventData.userId}

                                        Remember, this link is only valid until ${new Date(eventData.tokenExpiresAt.slice(0, -1)).toUTCString()}.

                                        -------------------------------------------------

                                        NO, I DID NOT REQUEST A PASSWORD RESET:
                                        
                                        If you didn't request a password reset, feel free to delete this email and carry on buying & selling tickets!
                                        
                                        If you still concern, please contact us immediately at help@zombilet.com.

                                        All the best,
                                        The Zombilet Team

                                    `
        

        const data = {
            title: titleUserForgotPassword,
            body: bodyUserForgotPassword,
        }

        return data
    }

    constructor(email: string, eventData: UserForgotPasswordInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
