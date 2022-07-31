import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../../nats-wrapper'

import { UserSignedInListener } from '../user-signed-in-listener'
import { UserSignedInEvent } from '@chato-zombilet/common'

// Helpers
import { getValidObjectId } from '../../../test/valid-id-generator'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    const listener = new UserSignedInListener(natsWrapper.client)

    // create a fake data event

    const data: UserSignedInEvent['data'] = {
        email: 'cemalsahabettin-signin@gmail.com'
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

it('receives the data', async () => {
    // Setup
    const { listener, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // Assert: Make sure ...

    // Placeholder assertion (only for init)
    expect(data.email).toEqual('cemalsahabettin-signin@gmail.com')
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
