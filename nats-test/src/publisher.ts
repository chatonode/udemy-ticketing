import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

const sc = nats.connect('zombilet', 'abc', {
    url: 'http://localhost:4222'
})

sc.on('connect', async () => {
    console.log('Publisher connected to STAN...')

    const data = {
        id: '1234',
        title: 'Teoman Geri Dönüyor 2022!!!',
        price: 2.40
    }

    const publisher = new TicketCreatedPublisher(sc)
    // For STAN Connection Errors, etc.
    try {
        await publisher.publish(data)
    } catch (err) {
        console.error(err)
    }
})

