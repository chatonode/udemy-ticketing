import { Message } from 'node-nats-streaming'

import { Listener, Subjects, OrderCancelledEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

import { Order, OrderStatus } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        const { id, version } = data

        // Applying in OCC Filtering
        const order = await Order.findPreviousVersion({
            id,
            version
        })

        if(!order) {
            // TODO: Better Error Handling Implementation
            throw new Error('Order not found')
        }

        // Updating(Cancelling) the Order
        order.set({
            status: OrderStatus.Cancelled
            // version NOT NEEDED: Plugin automatically increments the 'version' in '.save()'
        })
        await order.save()

        msg.ack()
    }
}
