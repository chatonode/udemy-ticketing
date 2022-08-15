import { Message } from 'node-nats-streaming'
import { Listener, Subjects, ExpirationCompletedEvent } from '@chato-zombilet/common'
import { queueGroupName } from './queue-group-name'

import { Order, OrderStatus } from '../../models/order'

import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationCompleted
    queueGroupName = queueGroupName

    async onMessage(data: ExpirationCompletedEvent['data'], msg: Message): Promise<void> {
        const { orderId } = data

        const order = await Order.findById(orderId).populate('ticket')

        if(!order) {
            // TODO: Better Error Handling Implementation
            throw new Error('Order not found')
        }

         // DO NOT CANCEL orders that were already completed(paid).
        if(order.status === OrderStatus.Completed) {
            return msg.ack()
        }

        // Cancel & Save the Order
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save()

        await new OrderCancelledPublisher(this.client).publish({
            userId: order.userId,
            id: order.id,
            version: order.version,
            status: order.status,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack()
    }
}
