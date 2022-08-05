import { SendingReasons } from '../../base/sending-reasons'
import { EmailData } from '../../base/base-sender'

export interface UserSignedInInt{
    sendingReason: SendingReasons.UserSignedIn
    data: EmailData
}
