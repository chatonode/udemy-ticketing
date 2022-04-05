import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCreatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const { userId, id, status, version, ticket } = data

        const createdOrder = Order.build({
            userId,
            id,
            status,
            price: ticket.price
        })
        await createdOrder.save()

        msg.ack()
    }
}


