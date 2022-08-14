import { OrderStatus } from '@chato-zombilet/common'

import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface OrderCompletedEventData extends EventData {
    userId: string
    orderId: string
    orderStatus: OrderStatus
}

export interface OrderCompletedInt {
    sendingReason: SendingReasons.OrderCompleted
    data: EmailData
    eventData: OrderCompletedEventData
}
