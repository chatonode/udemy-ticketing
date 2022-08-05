import { SendingReasons } from './sending-reasons'

export interface EmailData {
    title: string,
    body: string,
}

export interface BaseSender {
    sendingReason: SendingReasons
    data: EmailData
}
