import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'

import { UserSignedInListener } from '../user-signed-in-listener'
import { UserSignedInEvent } from '@chato-zombilet/common'

import { User } from '../../../models/user'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new UserSignedInListener(natsWrapper.client)

    // create a fake data event
    const data: UserSignedInEvent['data'] = {
        id: getValidObjectId(),
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

    // create a user before, to be reached
    await createUser(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Reach id and version for asserting
    const existingUser = await User.findOne({
        id: data.id,
        version: data.version
    })

    // Assert existing 
    expect(data.id).toEqual(existingUser!.id)
    expect(data.version).toEqual(existingUser!.version)
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

it('acks the message', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create a user before, to be reached
    await createUser(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
})
