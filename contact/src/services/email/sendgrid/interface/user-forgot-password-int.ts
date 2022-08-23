import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface UserForgotPasswordEventData extends EventData {
    userId: string
    tokenValue: string
    tokenExpiresAt: Date
}

export interface UserForgotPasswordInt {
    sendingReason: SendingReasons.UserForgotPassword
    data: EmailData
    eventData: UserForgotPasswordEventData
}
