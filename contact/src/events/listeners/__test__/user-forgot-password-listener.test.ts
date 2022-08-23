import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'
import sgMail from '@sendgrid/mail'

import { UserForgotPasswordListener } from '../user-forgot-password-listener'
import { UserForgotPasswordEvent } from '@chato-zombilet/common'

import { User } from '../../../models/user'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'
import { addHoursToDate } from './helpers/date'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new UserForgotPasswordListener(natsWrapper.client)

    // create a fake data event
    const tokenValue = 'sOmErAnDomStr1n6G'

    const data: UserForgotPasswordEvent['data'] = {
        id: getValidObjectId(),
        tokenValue,
        tokenExpiresAt: addHoursToDate(new Date(), 1),
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
    expect(data.id).toBeDefined()
    expect(data.id).toEqual(createdUser.id)
    expect(data.tokenValue).toBeDefined()
    expect(data.tokenValue).toEqual('sOmErAnDomStr1n6G')
    expect(data.tokenExpiresAt).toBeDefined()
    expect(data.version).toBeDefined()
    expect(data.version).toEqual(0)
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

it('throws an error with the old version of an existing user', async () => {
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
