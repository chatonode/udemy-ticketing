import { Message } from 'node-nats-streaming'

// Fake Import
import { natsWrapper } from '../../nats-wrapper'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

import { ExpirationCompletedPublisher } from '../../events/publishers/expiration-completed-publisher'
import { OrderCreatedEvent, OrderStatus } from '@chato-zombilet/common'

// Base Listener Setup
const setup = async () => {
    // create an instance of the listener
    // const listener = new OrderCreatedListener(natsWrapper.client)

    const orderId = '623fa40e31e651dc211238df'

    // Time Property
    const DELAY_IN_SECONDS = 1 * 10   // Test: 10 Seconds
    const expirationDate = new Date()
    expirationDate.setSeconds(expirationDate.getSeconds() + DELAY_IN_SECONDS)
    const expiresAt = new Date(expirationDate).toISOString()

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: orderId,
        version: 0,
        status: OrderStatus.Created,
        userId: 'asdsadsadsa',
        expiresAt,
        ticket: {
            id: '623fa40e31e651dc21123111',
            price: 15.28
        },
    }

    // create a fake message object
    // @ts-ignore   // For ignoring other properties of the Message
    const msg: Message = {
        ack: jest.fn(),
    }

    return {
        // listener,
        data,
        msg,
    }
}

it.todo(
    'acks the message'
//     , async () => {
//     // Setup
//     const { listener, data, msg } = await setup()

//     // call the onMessage function with the data object + message object
//     await listener.onMessage(data, msg)

//     // Assert: Make sure ack function is called
//     expect(msg.ack).toHaveBeenCalled()
//     expect(msg.ack).toHaveBeenCalledTimes(1)
// }
)


