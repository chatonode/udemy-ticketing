import { OrderStatus } from '@chato-zombilet/common'

import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface OrderCancelledEventData extends EventData {
    userId: string
    orderId: string
    orderStatus: OrderStatus
}

export interface OrderCancelledInt {
    sendingReason: SendingReasons.OrderCancelled
    data: EmailData
    eventData: OrderCancelledEventData
}
