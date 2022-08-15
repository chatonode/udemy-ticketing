import { Message } from 'node-nats-streaming'

import { Listener, Subjects, PaymentCreatedEvent } from '@chato-zombilet/common'
import { queueGroupName } from './queue-group-name'

import { Order, OrderStatus } from '../../models/order'

import { OrderCompletedPublisher } from '../publishers/order-completed-publisher'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
    queueGroupName = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
        const { orderId } = data

        const order = await Order.findById(orderId)

        if(!order) {
            // TODO: Better Error Handling Implementation
            throw new Error('Order not found')
        }

        order.set({ status: OrderStatus.Completed })
        await order.save()

        // Publisher(Optional) Order literally DIES here in our app on its final state as 'completed'.
        new OrderCompletedPublisher(this.client).publish({
            userId: order.userId,
            id: order.id,
            version: order.version,
            status: order.status
        })

        msg.ack()
    }
}
