import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCancelledEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
    queueGroupName = queueGroupName
    
    async onMessage(eventData: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        const {
            id: orderId,
            ticket
        } = eventData
        const {
            id: ticketId
        } = ticket

        console.log('ORDER CANCELLED: ', eventData)

        msg.ack()
    }
}
