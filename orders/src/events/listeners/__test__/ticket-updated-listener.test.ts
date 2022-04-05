import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'

import { TicketUpdatedListener } from '../ticket-updated-listener'
import { TicketUpdatedEvent } from '@chato-zombilet/common'

// Model
import { Ticket } from '../../../models/ticket'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create a fake data event
    const id = getValidObjectId()
    const userId = getValidObjectId()
    const data: TicketUpdatedEvent['data'] = {
        id,
        version: 0 + 1, // 0: Created -> 1: Updated
        title: 'Manute Bol vs. Bol Bol Dunk Contest',
        price: 26.99,
        userId,
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

it('does not find a non-existing ticket', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // skip creating a ticket

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Ticket Not Found
    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }
})

it('does not find a previous version of an existing ticket', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create a ticket before, to be updated
    await createTicket(data.id)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Ticket Not Found
    try {
        await listener.onMessage({
            ...data,
            version: data.version + 1       // Some Future Version of the Event Data
        }, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }

    expect(msg.ack).not.toHaveBeenCalled()
})

it('finds, updates, and saves an existing ticket', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create a ticket before, to be updated
    const createdTicket = await createTicket(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure a ticket was updated
    const updatedTicket = await Ticket.findById(createdTicket.id)

    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)

    expect(updatedTicket!.version).toEqual(createdTicket.version + 1)
    expect(updatedTicket!.title).not.toEqual(createdTicket.title)
    expect(updatedTicket!.price).not.toEqual(createdTicket.price)
})

it('acks the message', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create a ticket before, to be updated
    await createTicket(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
})
