import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
import sgMail from '@sendgrid/mail'

import { OrderCancelledListener } from '../order-cancelled-listener'
import { OrderCancelledEvent, OrderStatus } from '@chato-zombilet/common'

import { User } from '../../../models/user'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        userId: getValidObjectId(),
        id: getValidObjectId(),
        status: OrderStatus.Cancelled,
        version: 1,
        ticket: {
            id: getValidObjectId()
        }
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
    const createdUser = await createUser(data.userId)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert
    expect(data.userId).toBeDefined()
    expect(data.userId).toEqual(createdUser.id)
    expect(data.id).toBeDefined()
    expect(data.status).toBeDefined()
    expect(data.status).toEqual(OrderStatus.Cancelled)
    expect(data.version).toBeDefined()
    expect(data.version).toEqual(1)
})

it('throws an error with a non-existing user', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // skip creating a user before
    // await createUser(data.userId)

    // Assert: make sure calling the onMessage function with the data object + message object
    // -> returns an error: User Not Found
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
    await createUser(data.userId)

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
    await createUser(data.userId)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
})
