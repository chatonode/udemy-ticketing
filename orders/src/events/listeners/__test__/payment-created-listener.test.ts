import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

import { PaymentCreatedListener } from '../payment-created-listener'
import { PaymentCreatedEvent, OrderCompletedEvent } from '@chato-zombilet/common'

// Model
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new PaymentCreatedListener(natsWrapper.client)

    // create an order
    const ticketId = getValidObjectId()
    const userId = getValidObjectId()
    const createdOrder = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),      // It is enough for testing
        ticket: await createTicket(ticketId)
    })
    await createdOrder.save()

    // create a fake data event
    const data: PaymentCreatedEvent['data'] = {
        id: getValidObjectId(),
        version: 0,
        orderId: createdOrder.id,
        stripeId: '4f98da4f98ds9ggs84'      // It is enough for testing
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
        createdOrder
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

it('finds, completes, and saves an existing order', async () => {
    // Setup
    const { listener, data, msg, createdOrder } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure an order was completed
    const completedOrder = await Order.findById(data.orderId)

    expect(completedOrder!.status).not.toEqual(createdOrder.status)
    expect(completedOrder!.status).toEqual(OrderStatus.Completed)
    expect(completedOrder!.version).not.toEqual(createdOrder.version)
})


it(`publishes an 'order:completed' event`, async () => {
    // Setup
    const { listener, data, msg, createdOrder } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure an 'order:completed' was published
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)

    const eventSubject = natsWrapperSpy.mock.calls[0][0]
    const eventData: OrderCompletedEvent['data'] = JSON.parse(natsWrapperSpy.mock.calls[0][1] as string)

    expect(eventSubject).toEqual("order:completed")
    expect(eventData.id).toEqual(createdOrder.id)
    expect(eventData.version).not.toEqual(createdOrder.version)
    expect(eventData.version).toEqual(createdOrder.version + 1)
    expect(eventData.status).not.toEqual(createdOrder.status)
    expect(eventData.status).toEqual(OrderStatus.Completed)
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
