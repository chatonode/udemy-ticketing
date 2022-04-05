import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, 'publish')

import { ExpirationCompletedListener } from '../expiration-completed-listener'
import {
    ExpirationCompletedEvent,
    OrderCancelledEvent,
} from '@chato-zombilet/common'

// Model
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new ExpirationCompletedListener(natsWrapper.client)

    // create an order
    const ticketId = getValidObjectId()
    const userId = getValidObjectId()
    const createdOrder = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(), // Gibberish is enough
        ticket: await createTicket(ticketId),
    })
    await createdOrder.save()

    // create a fake data event
    const data: ExpirationCompletedEvent['data'] = {
        orderId: createdOrder.id,
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
        createdOrder,
    }
}

// Ticket Creator
const createTicket = async (id: string) => {
    const createdTicket = Ticket.build({
        id,
        title: 'Dunk Contest',
        price: 15.01,
    })
    await createdTicket.save()

    return createdTicket
}

it('does not find a non-existing order', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // delete order
    await Order.findByIdAndDelete(data.orderId)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Order Not Found
    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }
})

it(`does not cancel an existing 'completed' order`, async () => {
    // Setup
    const { listener, data, msg, createdOrder } = await setup()

    // complete an order before, to be cancelled
    const order = await Order.findById(createdOrder.id)
    order!.set({ status: OrderStatus.Completed })
    await order!.save()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure an order was cancelled
    const notCancelledOrder = await Order.findById(data.orderId)

    expect(notCancelledOrder!.status).not.toEqual(createdOrder.status)
    expect(notCancelledOrder!.status).not.toEqual(OrderStatus.Cancelled)
    expect(notCancelledOrder!.status).toEqual(OrderStatus.Completed)

    expect(notCancelledOrder!.version).not.toEqual(createdOrder.version)
    expect(notCancelledOrder!.version).toEqual(createdOrder.version + 1)

    // Assert: Make sure ack function is called (early return)
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)

    // Assert: Make sure a 'order:cancelled' was not published
    expect(natsWrapperSpy).not.toHaveBeenCalled()
    expect(natsWrapperSpy).toHaveBeenCalledTimes(0)
})

it('finds, cancels, and saves an existing order', async () => {
    // Setup
    const { listener, data, msg, createdOrder } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure an order was cancelled
    const cancelledOrder = await Order.findById(data.orderId)

    expect(cancelledOrder!.status).not.toEqual(createdOrder.status)
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled)
    expect(cancelledOrder!.version).not.toEqual(createdOrder.version)
})

it(`publishes an 'order:cancelled' event`, async () => {
    // Setup
    const { listener, data, msg, createdOrder } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure a 'order:cancelled' was published
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)

    const eventSubject = natsWrapperSpy.mock.calls[0][0]
    const eventData: OrderCancelledEvent['data'] = JSON.parse(
        natsWrapperSpy.mock.calls[0][1] as string
    )

    expect(eventSubject).toEqual('order:cancelled')
    expect(eventData.id).toEqual(createdOrder.id)
    expect(eventData.version).not.toEqual(createdOrder.version)
    expect(eventData.ticket.id).toEqual(createdOrder.ticket.id)
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
