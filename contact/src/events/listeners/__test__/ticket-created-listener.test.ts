import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
import sgMail from '@sendgrid/mail'

import { TicketCreatedListener } from '../ticket-created-listener'
import { TicketCreatedEvent } from '@chato-zombilet/common'

import { User } from '../../../models/user'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client)

    // create a fake data event
    const data: TicketCreatedEvent['data'] = {
        userId: getValidObjectId(),
        id: getValidObjectId(),
        title: 'Hasan MEZARCI | Fasa Fiso Fest',
        price: 27.99,
        version: 0
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

// User Creator
const createUser = async (id: string) => {
    const createdUser = User.build({
        id,
        email: `test.${id}@test.com`
    })
    await createdUser.save()

    return createdUser
}


it('receives the data', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create an existing user before
    const createdUser = await createUser(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert
    expect(data.userId).toBeDefined()
    expect(data.userId).toEqual(createdUser.id)
    expect(data.id).toBeDefined()
    expect(data.title).toBeDefined()
    expect(data.title).toEqual('Hasan MEZARCI | Fasa Fiso Fest')
    expect(data.price).toBeDefined()
    expect(data.price).toEqual(27.99)
    expect(data.version).toBeDefined()
    expect(data.version).toEqual(0)
})

it('throws an error with a non-existing user', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // skip creating a user before
    // await createUser(data.id)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: Ticket Not Found
    try {
        await listener.onMessage(data, msg)
    } catch (err) {
        expect(err).toBeDefined()
    }

    // Assert: Make sure ack function is not called
    expect(msg.ack).not.toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(0)
})

it('sends an email', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create an existing user before
    await createUser(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert
    expect(sgMail.send).toHaveBeenCalled()
    expect(sgMail.send).toHaveBeenCalledTimes(1)
})

it('acks the message', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create an existing user before
    await createUser(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
})
