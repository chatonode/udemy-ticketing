import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'

import { OrderCancelledListener } from '../order-cancelled-listener'
import { OrderCancelledEvent } from '@chato-zombilet/common'

// Model
import { Order, OrderStatus } from '../../../models/order'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    // create a fake data event
    const id = getValidObjectId()
    const ticketId = getValidObjectId()
    const data: OrderCancelledEvent['data'] = {
        id,
        version: 0 + 1, // 0: Created -> 1: Cancelled
        ticket: {
            id: ticketId,
        },
    }

    // create a fake message object
    // @ts-ignore   // For ignoring other properties of the Message
    const msg: Message = {
        ack: jest.fn(),
    }

    return {
        listener,
        data,
        msg,
    }
}

// Order Creator
const createOrder = async (id: string) => {
    const userId = getValidObjectId()
    const createdOrder = Order.build({
        id,
        userId,
        status: OrderStatus.Created,
        price: 15.01,
    })
    await createdOrder.save()

    return createdOrder
}

it('does not find a non-existing order', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // Create and Delete a Created order
    await createOrder(data.id)
    await Order.findByIdAndDelete(data.id)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Order Not Found
    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }
})

it('does not find a previous version of an existing order', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create an order before, to be cancelled
    await createOrder(data.id)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Order Not Found
    try {
        await listener.onMessage(
            {
                ...data,
                version: data.version + 1, // Some Future Version of the Event Data
            },
            msg
        )
    } catch (err) {
        expect(err).toBeDefined()
    }

    expect(msg.ack).not.toHaveBeenCalled()
})

it('finds, cancels, and saves an existing order', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create an order before, to be cancelled
    const createdOrder = await createOrder(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure an order was cancelled
    const cancelledOrder = await Order.findById(createdOrder.id)

    expect(cancelledOrder).toBeDefined()
    expect(cancelledOrder!.version).toEqual(data.version)

    expect(cancelledOrder!.version).toEqual(createdOrder.version + 1)
    expect(cancelledOrder!.price).toEqual(createdOrder.price)

    // Status
    expect(cancelledOrder!.status).not.toEqual(createdOrder.status)
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create an order before, to be updated
    await createOrder(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
})
