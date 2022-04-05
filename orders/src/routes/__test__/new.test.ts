import request from 'supertest'
import { app } from '../../app'

import { getValidCookie } from '../../test/auth-helper'
import { getValidObjectId } from '../../test/valid-id-generator'

import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'
import { Subjects } from '@chato-zombilet/common'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

it(`has a route handler listening to '/api/orders' for post requests`, async () => {
    const response = await request(app).post('/api/orders').send({})

    expect(response.status).not.toEqual(404)
})

it(`returns a '401' if the user is not authenticated`, async () => {
    await request(app).post('/api/orders').send({}).expect(401)
})

it(`returns a status other than '401' if the user is authenticated`, async () => {
    const cookie = await getValidCookie()

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({})

    expect(response.status).not.toEqual(401)
})

it(`returns a '400' if an invalid ticketId is provided`, async () => {
    const cookie = await getValidCookie()

    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: '',
        })
        .expect(400)

    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: '12345678',
        })
        .expect(400)
})

it(`returns a '404' if trying to order a non-existing ticket`, async () => {
    const cookie = await getValidCookie()
    const ticketId = getValidObjectId()

    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId,
        })
        .expect(404)
})

it(`returns a '400' if trying to order a reserved ticket`, async () => {
    // Pre-Conditions
    const cookie = await getValidCookie()

    const ticket = Ticket.build({
        id: getValidObjectId(),
        title: 'Return of the King Tribute - Jan 2023',
        price: 29,
    })
    await ticket.save()

    const order = Order.build({
        userId: 'asdsadsada',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    })
    await order.save()

    // Test
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        .expect(400)
})

it(`returns a '201' if trying to order a valid(unreserved) ticket`, async () => {
    // Pre-Conditions
    const cookie = await getValidCookie()

    const ticket = Ticket.build({
        id: getValidObjectId(),
        title: 'Return of the King Tribute - Jan 2023',
        price: 29,
    })
    await ticket.save()

    // Test
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        .expect(201)

    // Assert
    const createdOrder = response.body

    const storedOrder = await Order.findById(createdOrder.id).populate('ticket')
    expect(storedOrder).not.toBeNull()
    // expect(createdOrder).toEqual(storedOrder)    // Not a good test maybe...
    // Order
    expect(createdOrder.status).toEqual(storedOrder.status)
    expect(createdOrder.userId).toEqual(storedOrder.userId)
    // expect(createdOrder.expiresAt).toEqual(storedOrder.expiresAt)

    // Order's Ticket
    expect(createdOrder.ticket).not.toEqual({})
    expect(createdOrder.ticket.id).toEqual(storedOrder.ticket.id)
    expect(createdOrder.ticket.title).toEqual(storedOrder.ticket.title)
    expect(createdOrder.ticket.price).toEqual(storedOrder.ticket.price)

    // console.log('CREATED ORDER unreserved:', createdOrder)
    // console.log('STORED ORDER unreserved:', storedOrder)
})

it(`returns a '201' if trying to order a valid(cancelled) ticket`, async () => {
    // Pre-Conditions
    const cookie = await getValidCookie()

    const ticket = Ticket.build({
        id: getValidObjectId(),
        title: 'Return of the King Tribute - Jan 2023',
        price: 29,
    })
    await ticket.save()

    const order = Order.build({
        userId: 'asdsadsada',
        status: OrderStatus.Cancelled,
        expiresAt: new Date(),
        ticket,
    })
    await order.save()

    // Test
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        .expect(201)

    // Assert
    const createdOrder = response.body

    const storedOrder = await Order.findById(createdOrder.id).populate('ticket')
    expect(storedOrder).not.toBeNull()
    // expect(createdOrder).toEqual(storedOrder)    // Not a good test maybe...
    // Order
    expect(createdOrder.status).toEqual(storedOrder.status)
    expect(createdOrder.userId).toEqual(storedOrder.userId)
    // expect(createdOrder.expiresAt).toEqual(storedOrder.expiresAt)

    // Order's Ticket
    expect(createdOrder.ticket).not.toEqual({})
    expect(createdOrder.ticket.id).toEqual(storedOrder.ticket.id)
    expect(createdOrder.ticket.title).toEqual(storedOrder.ticket.title)
    expect(createdOrder.ticket.price).toEqual(storedOrder.ticket.price)

    // console.log('CREATED ORDER cancelled:', createdOrder)
    // console.log('STORED ORDER cancelled:', storedOrder)
})

it(`publishes an 'order:created' event`, async () => {
    // Pre-Conditions
    const cookie = await getValidCookie()

    const ticket = Ticket.build({
        id: getValidObjectId(),
        title: 'Return of the King Tribute - Jan 2023',
        price: 29,
    })
    await ticket.save()

    // Test
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        .expect(201)

    // Event Assertion
    // // Publisher Invoked: 'order-created'
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    // // Event Subject
    const createdEventSubject = natsWrapperSpy.mock.calls[0][0]
    expect(createdEventSubject).toEqual(Subjects.OrderCreated)
})
