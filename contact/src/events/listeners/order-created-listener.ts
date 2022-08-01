import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCreatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const { id: orderId, status, userId, expiresAt, ticket } = data
        const { id: ticketId, price: ticketPrice } = ticket

        console.log('ORDER CREATED: ', data)

        msg.ack()
    }
}
