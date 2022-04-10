import mongoose from 'mongoose'

import { app } from './app'

import { natsWrapper } from './nats-wrapper'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { ExpirationCompletedListener } from './events/listeners/expiration-completed-listener'
import { PaymentCreatedListener } from './events/listeners/payment-created-listener'

const start = async () => {
    // Env: JWT_KEY exists (to be able to use 'process.env.JWT_KEY!')
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined.')
    }

    // Env: MONGO_URI exists
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined.')
    }

    /* Envs: NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL exists */
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined.')
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined.')
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined.')
    }

    try {
        // Event Bus
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            {
                url: process.env.NATS_URL,
            }
        )

        // // Graceful Shutdown // //
        natsWrapper.client.on('close', () => {
            console.log('Disconnected from STAN!')
            process.exit()
        })

        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())
        // // Graceful Shutdown // //

        // Listener Initialization
        new TicketCreatedListener(natsWrapper.client).listen()
        new TicketUpdatedListener(natsWrapper.client).listen()
        new ExpirationCompletedListener(natsWrapper.client).listen()
        new PaymentCreatedListener(natsWrapper.client).listen()

        // DB
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB...')
    } catch (err) {
        console.error(err)
    }

    const PORT = 3000

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`)
    })
}

start()
