import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface UserSignedUpEventData extends EventData {
    userId: string
    email: string
}

export interface UserSignedUpInt{
    sendingReason: SendingReasons.UserSignedUp
    data: EmailData
    eventData: UserSignedUpEventData
}
