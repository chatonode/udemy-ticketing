import { OrderStatus } from '@chato-zombilet/common'

import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface OrderCompletedEventData extends EventData {
    userId: string  // TODO: Share it through the event
    orderId: string
    orderStatus: OrderStatus
}

export interface OrderCreatedInt {
    sendingReason: SendingReasons.OrderCompleted
    data: EmailData
    eventData: OrderCompletedEventData
}
