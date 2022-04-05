import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

import { OrderCreatedListener } from '../order-created-listener'
import { OrderCreatedEvent, OrderStatus, TicketUpdatedEvent } from '@chato-zombilet/common'

// Model
import { Ticket } from '../../../models/ticket'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create a ticket before, to be reserved
    const createdTicket = Ticket.build({
        title: 'Enes Freedom Mac Lubbe Dunk Contest',
        price: 15.07,
        userId: getValidObjectId(),     // Owner of Ticket
    })
    await createdTicket.save()

    // create a fake data event
    const id = getValidObjectId()
    const userId = getValidObjectId()
    const data: OrderCreatedEvent['data'] = {
        id,
        version: 0,
        status: OrderStatus.Created,
        userId,     // Owner of Order
        expiresAt: new Date().toISOString(),
        ticket: {
            id: createdTicket.id,
            price: createdTicket.price
        },
    }

    // create a fake message object
    // @ts-ignore   // For ignoring other properties of the Message
    const msg: Message = {
        ack: jest.fn(),
    }

    return {
        listener,
        createdTicket,
        data,
        msg,
    }
}

it('does not find a non-existing ticket', async () => {
    // Setup
    const { listener, createdTicket, data, msg } = await setup()

    // delete created ticket
    await Ticket.findByIdAndDelete(createdTicket.id)


    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Ticket Not Found
    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }
})

it(`finds, reserves, and saves an existing ticket; with the 'orderId' property`, async () => {
    // Setup
    const { listener, createdTicket, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure a ticket was reserved
    const reservedTicket = await Ticket.findById(createdTicket.id)

    expect(reservedTicket).toBeDefined()
    expect(reservedTicket!.orderId).toBeDefined()

    expect(reservedTicket!.orderId).toEqual(data.id)
    expect(reservedTicket!.price).toEqual(data.ticket.price)
})

it(`publishes a 'ticket:updated' event`, async () => {
    // Setup
    const { listener, createdTicket, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure a 'ticket:updated' was published
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)

    const eventSubject = natsWrapperSpy.mock.calls[0][0]
    const eventData: TicketUpdatedEvent['data'] = JSON.parse(natsWrapperSpy.mock.calls[0][1] as string)

    expect(eventSubject).toEqual("ticket:updated")
    expect(eventData.orderId).toBeDefined()
    expect(eventData.orderId).toEqual(data.id)
    expect(eventData.version).toEqual(createdTicket.version + 1)
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
