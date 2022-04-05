import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'

import { OrderCreatedListener } from '../order-created-listener'
import { OrderCreatedEvent } from '@chato-zombilet/common'

// Model
import { Order, OrderStatus } from '../../../models/order'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create a fake data event
    const id = getValidObjectId()
    const userId = getValidObjectId()
    const ticketId = getValidObjectId()
    const data: OrderCreatedEvent['data'] = {
        id,
        version: 0,
        status: OrderStatus.Created,
        userId,
        expiresAt: new Date().toUTCString(),
        ticket: {
            id: ticketId,
            price: 16.99
        }
    }

    // create a fake message object
    // @ts-ignore       // For ignoring other properties of the Message
    const msg: Message = {
        ack: jest.fn(),
    }

    return {
        listener,
        data,
        msg,
    }
}

it('creates and saves an order', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure an order was created
    const order = await Order.findById(data.id)

    expect(order).toBeDefined()
    expect(order!.id).toEqual(data.id)
    expect(order!.version).toEqual(data.version)        // Assuming similar versioning on updates between Orders and Payments services
    expect(order!.status).toEqual(data.status)
    expect(order!.userId).toEqual(data.userId)
    expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
})
