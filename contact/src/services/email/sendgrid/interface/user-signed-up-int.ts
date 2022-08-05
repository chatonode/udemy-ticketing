import { SendingReasons } from '../../base/sending-reasons'
import { EmailData } from '../../base/base-sender'

export interface UserSignedUpInt{
    sendingReason: SendingReasons.UserSignedUp
    data: EmailData
}
