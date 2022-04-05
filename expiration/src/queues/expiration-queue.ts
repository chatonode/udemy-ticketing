import Queue from 'bull'

import { natsWrapper } from '../nats-wrapper'
import { ExpirationCompletedPublisher } from '../events/publishers/expiration-completed-publisher'

interface Payload {
    orderId: string
}

// Create a Job
const expirationQueue = new Queue<Payload>('order-expiration', {
    redis: {
        host: process.env.REDIS_HOST,
        port: 6379
    }
})

// Process a Job
expirationQueue.process(async (job) => {
    const orderId = job.data.orderId

    // Publish an event saying that an expiration was completed
    // TODO: await with some Rollback Mechanism
    new ExpirationCompletedPublisher(natsWrapper.client).publish({
        orderId
    })
})

export { expirationQueue }