import { SendingReasons } from './sending-reasons'
// More Centralized SendingReasons Exporter
export { SendingReasons }

import { EventData } from './event-data'
// More Centralized EventData Exporter
export { EventData }

export interface EmailData {
    title: string,
    body: string,
}

export interface BaseSender {
    sendingReason: SendingReasons
    data: EmailData
    eventData: EventData
}
