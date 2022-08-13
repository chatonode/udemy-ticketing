import { OrderStatus } from '@chato-zombilet/common'

import { SendingReasons, EmailData, EventData } from '../../base/base-sender'

interface OrderCreatedEventData extends EventData {
    userId: string
    orderId: string
    orderStatus: OrderStatus
    orderExpiresAt: string
    ticketId: string
    ticketPrice: number
}

export interface OrderCreatedInt {
    sendingReason: SendingReasons.OrderCreated
    data: EmailData
    eventData: OrderCreatedEventData
}
