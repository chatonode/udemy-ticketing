import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
import sgMail from '@sendgrid/mail'

import { UserChangedPasswordListener } from '../user-changed-password-listener'
import { UserChangedPasswordEvent } from '@chato-zombilet/common'

import { User } from '../../../models/user'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new UserChangedPasswordListener(natsWrapper.client)

    // create a fake data event
    const data: UserChangedPasswordEvent['data'] = {
        id: getValidObjectId(),
        version: 1
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
    expect(data.id).toBeDefined()
    expect(data.id).toEqual(createdUser.id)
    expect(data.version).toBeDefined()
    expect(data.version).not.toEqual(createdUser.version)
    expect(data.version).toEqual(1)
})

it('throws an error with a non-existing user', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // skip creating a user before
    // await createUser(data.id)

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

it('throws an error with the already updated version of an existing user', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create a user before
    const createdUser = await createUser(data.id)
    
    // Increment the version of the user by just 'saving' it ('updateIfCurrentPlugin' feature)
    await createdUser.save()

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

it('increments the version of an existing user', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // create a user before
    const createdUser = await createUser(data.id)

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)
    
    // Assert
    const existingUser = await User.findById(createdUser.id)

    expect(existingUser!.version).toEqual(createdUser.version + 1)
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
