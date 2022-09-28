import { TokenType } from '@chato-zombilet/common'
import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface UserForgotPasswordEventData extends EventData {
    userId: string
    tokenValue: string
    tokenType: TokenType.ForgotPassword
    tokenExpiresAt: string
}

export interface UserForgotPasswordInt {
    sendingReason: SendingReasons.UserForgotPassword
    data: EmailData
    eventData: UserForgotPasswordEventData
}
