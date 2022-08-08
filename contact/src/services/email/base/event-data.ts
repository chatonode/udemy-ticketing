import { OrderStatus } from '@chato-zombilet/common'

export interface EventData {
    userId?: string
    ticketId?: string
    ticketTitle?: string
    ticketPrice?: number
    orderId?: string
    orderStatus?: OrderStatus
    orderExpiresAt?: string
}
