import nats from 'node-nats-streaming'
// For test env
import { randomBytes } from 'crypto'

import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear()

const sc = nats.connect('zombilet', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222',
})

sc.on('connect', () => {
    console.log('Listener connected to STAN...')

    sc.on('close', () => {
        console.log('STAN connection closed!')
        process.exit()
    })

    // Using Listener Sub-Class
    new TicketCreatedListener(sc).listen()
})

// CTRL - C on terminal sometimes sends one of these signals:
process.on('SIGINT', () => sc.close())
process.on('SIGTERM', () => sc.close())

/* --- */

