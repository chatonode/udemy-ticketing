import { Message } from 'node-nats-streaming'
import { Listener, Subjects, OrderCreatedEvent } from '@chato-zombilet/common'
import { queueGroupName } from './queue-group-name'

import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const { id, expiresAt} = data

        const delay = new Date(expiresAt).getTime() - new Date().getTime()
        console.log(`Waiting ${delay} milliseconds to process the job...`)

        // Enqueue a Job
        await expirationQueue.add({
            orderId: id
        },
        {
            delay
        }
        )

        msg.ack()
    }
}