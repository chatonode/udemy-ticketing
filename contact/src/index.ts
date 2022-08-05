import { app } from './app'

import sgMail from '@sendgrid/mail'

import { natsWrapper } from './nats-wrapper'
import { UserSignedUpListener } from './events/listeners/user-signed-up-listener'
import { UserSignedInListener } from './events/listeners/user-signed-in-listener'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCompletedListener } from './events/listeners/order-completed-listener'

const start = async () => {
    console.log('Starting...')

    // Env: JWT_KEY exists (to be able to use 'process.env.JWT_KEY!')
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined.')
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

    /* Envs: SENDGRID_KEY, SENGRID_EMAIL exists */
    if (!process.env.SENDGRID_KEY) {
        throw new Error('SENDGRID_KEY must be defined.')
    }
    if (!process.env.SENDGRID_EMAIL) {
        throw new Error('SENDGRID_EMAIL must be defined.')
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
        new UserSignedUpListener(natsWrapper.client).listen()
        new UserSignedInListener(natsWrapper.client).listen()
        new TicketCreatedListener(natsWrapper.client).listen()
        new TicketUpdatedListener(natsWrapper.client).listen()
        new OrderCreatedListener(natsWrapper.client).listen()
        new OrderCancelledListener(natsWrapper.client).listen()
        new OrderCompletedListener(natsWrapper.client).listen()
        
        // Sendgrid
        sgMail.setApiKey(process.env.SENDGRID_KEY)

    } catch (err) {
        console.error(err)
    }

    const PORT = 3000

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`)
    })
}

start()
