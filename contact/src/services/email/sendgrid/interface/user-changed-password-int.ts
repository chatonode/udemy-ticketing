import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface UserChangedPasswordEventData extends EventData {
    userId: string
}

export interface UserChangedPasswordInt {
    sendingReason: SendingReasons.UserChangedPassword
    data: EmailData
    eventData: UserChangedPasswordEventData
}
