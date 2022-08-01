import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCompletedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    readonly subject = Subjects.OrderCompleted
    queueGroupName = queueGroupName

    async onMessage(data: OrderCompletedEvent['data'], msg: Message): Promise<void> {
        const { id: orderId, status } = data

        console.log('ORDER COMPLETED: ', data)

        msg.ack()
    }
}
