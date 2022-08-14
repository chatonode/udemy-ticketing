import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

import { OrderCancelledListener } from '../order-cancelled-listener'
import { OrderStatus, OrderCancelledEvent, TicketUpdatedEvent } from '@chato-zombilet/common'

// Model
import { Ticket } from '../../../models/ticket'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    const userId = getValidObjectId()

    // create a ticket before, to be unreserved
    const orderId = getValidObjectId()
    const reservedTicket = Ticket.build({
        title: 'Enes Freedom Mac Lubbe Dunk Contest',
        price: 15.07,
        userId
    })
    await reservedTicket.save()

    // reserve this ticket
    reservedTicket.set({ orderId })
    await reservedTicket.save()

    // create a fake data event
    const id = reservedTicket.orderId!
    const data: OrderCancelledEvent['data'] = {
        userId,
        id,
        version: 1,
        status: OrderStatus.Cancelled,
        ticket: {
            id: reservedTicket.id,
        },
    }

    // create a fake message object
    // @ts-ignore   // For ignoring other properties of the Message
    const msg: Message = {
        ack: jest.fn(),
    }

    return {
        listener,
        reservedTicket,
        data,
        msg,
    }
}

it('does not find a non-existing ticket', async () => {
    // Setup
    const { listener, reservedTicket, data, msg } = await setup()

    // delete created ticket
    await Ticket.findByIdAndDelete(reservedTicket.id)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Ticket Not Found
    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }
})

it(`finds, unreserves, and saves an existing ticket; without the 'orderId' property`, async () => {
    // Setup
    const { listener, reservedTicket, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure a ticket was unreserved
    const unreservedTicket = await Ticket.findById(reservedTicket.id)

    expect(unreservedTicket).toBeDefined()
    expect(unreservedTicket!.orderId).toBeUndefined()

    expect(unreservedTicket!.orderId).not.toEqual(data.id)

    // User
    expect(unreservedTicket!.userId).toBeDefined()
    expect(unreservedTicket!.userId).toEqual(data.userId)
})

it(`publishes a 'ticket:updated' event`, async () => {
    // Setup
    const { listener, reservedTicket, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure a 'ticket:updated' was published
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)

    const eventSubject = natsWrapperSpy.mock.calls[0][0]
    const eventData: TicketUpdatedEvent['data'] = JSON.parse(natsWrapperSpy.mock.calls[0][1] as string)

    expect(eventSubject).toEqual("ticket:updated")
    expect(eventData.orderId).toBeUndefined()
    expect(eventData.orderId).not.toEqual(data.id)
    expect(eventData.version).toEqual(reservedTicket.version + 1)
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
