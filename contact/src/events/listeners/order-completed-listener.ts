import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCompletedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    readonly subject = Subjects.OrderCompleted
    queueGroupName = queueGroupName

    async onMessage(eventData: OrderCompletedEvent['data'], msg: Message): Promise<void> {
        const {
            id: orderId,
            status: orderStatus
        } = eventData

        console.log('ORDER COMPLETED: ', eventData)

        msg.ack()
    }
}
