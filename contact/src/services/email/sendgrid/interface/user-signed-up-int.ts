import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface UserSignedUpEventData extends EventData {
    email: string
}

export interface UserSignedUpInt{
    sendingReason: SendingReasons.UserSignedUp
    data: EmailData
    eventData: UserSignedUpEventData
}
