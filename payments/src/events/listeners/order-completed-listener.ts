import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCompletedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { Order, OrderStatus } from '../../models/order'

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    readonly subject = Subjects.OrderCompleted
    queueGroupName = queueGroupName

    async onMessage(data: OrderCompletedEvent['data'], msg: Message): Promise<void> {
        const { id, version, status } = data

        // Applying in OCC Filtering
        const order = await Order.findPreviousVersion({
            id,
            version
        })

        if(!order) {
            // TODO: Better Error Handling Implementation
            throw new Error('Order not found')
        }

        // Completing the Order
        order.set({
            status
            // version NOT NEEDED: Plugin automatically increments the 'version' in '.save()'
        })
        await order.save()

        msg.ack()
    }
}
