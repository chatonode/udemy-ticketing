import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface UserSignedInEventData extends EventData {
    email: string
}

export interface UserSignedInInt{
    sendingReason: SendingReasons.UserSignedIn
    data: EmailData
    eventData: UserSignedInEventData
}
