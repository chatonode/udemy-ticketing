import request from 'supertest'
import { app } from '../../app'

import { getValidCookie } from '../../test/auth-helper'
import { getValidObjectId } from '../../test/valid-id-generator'

import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

const createTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({
        id: getValidObjectId(),
        title,
        price,
    })
    await ticket.save()

    return ticket
}

it(`has a route handler listening to '/api/orders' for get requests`, async () => {
    const response = await request(app).get('/api/orders').send()

    expect(response.status).not.toEqual(404)
})

it(`returns a '401' if the user is not authenticated`, async () => {
    await request(app).get('/api/orders').send().expect(401)
})

it(`returns a status other than '401' if the user is authenticated`, async () => {
    const cookie = await getValidCookie()

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie)
        .send()

    expect(response.status).not.toEqual(401)
})

it(`can fetch an empty list of orders for a particular user`, async () => {
    const cookie = await getValidCookie()

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(0)
})

it(`can fetch orders for a particular user (from db)`, async () => {
    /* Pre-Conditions */
    // Create 3 Tickets
    const ticket1 = await createTicket('Massive Attack Europe Tour', 59.9)
    const ticket2 = await createTicket('Konya: Techno Hortum Fest', 40)
    const ticket3 = await createTicket(
        'Manisa 5972. Geleneksel Mesir Macunu Festivali',
        5.12
    )

    // User Ids
    const userId1 = getValidObjectId()
    const userId2 = getValidObjectId()

    // Create 1 Order as User #1
    const order1 = Order.build({
        userId: userId1,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket1,
    })
    order1.save()

    // Create 2 Orders as User #2
    const order2 = Order.build({
        userId: userId2,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket2,
    })
    order2.save()

    const order3 = Order.build({
        userId: userId2,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket3,
    })
    order3.save()

    /* Assert */
    // User #0(Random) got 0 Orders
    const cookie0 = await getValidCookie()
    const { body: createdOrders0 } = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie0)
        .send()
        .expect(200)
    expect(createdOrders0.length).toEqual(0)

    // User #1 got 1 Order
    const cookie1 = await getValidCookie(userId1)
    const { body: createdOrders1 } = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie1)
        .send()
        .expect(200)
    expect(createdOrders1.length).toEqual(1)
    expect(createdOrders1[0].ticket.id).toEqual(ticket1.id)

    // User #2 got 2 Orders
    const cookie2 = await getValidCookie(userId2)
    const { body: createdOrders2 } = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie2)
        .send()
        .expect(200)
    expect(createdOrders2.length).toEqual(2)
    expect(createdOrders2[0].ticket.id).toEqual(ticket2.id)
    expect(createdOrders2[1].ticket.id).toEqual(ticket3.id)
})


it(`can fetch orders for a particular user (via 'new' endpoint)`, async () => {
    /* Pre-Conditions */
    // Create 3 Tickets
    const ticket1 = await createTicket('Massive Attack Europe Tour', 59.9)
    const ticket2 = await createTicket('Konya: Techno Hortum Fest', 40)
    const ticket3 = await createTicket(
        'Manisa 5972. Geleneksel Mesir Macunu Festivali',
        5.12
    )

    // User Ids
    const userId1 = getValidObjectId()
    const userId2 = getValidObjectId()

    // Cookies
    const cookie1 = await getValidCookie(userId1)
    const cookie2 = await getValidCookie(userId2)

    // Create 1 Order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket1.id
        })
        .expect(201)

    // Create 2 Orders as User #2
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket2.id
        })
        .expect(201)

    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket3.id
        })
        .expect(201)

    /* Assert */
    // User #0(Random) got 0 Orders
    const cookie0 = await getValidCookie()
    const { body: createdOrders0 } = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie0)
        .send()
        .expect(200)
    expect(createdOrders0.length).toEqual(0)

    // User #1 got 1 Order
    const { body: createdOrders1 } = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie1)
        .send()
        .expect(200)
    expect(createdOrders1.length).toEqual(1)
    expect(createdOrders1[0].ticket.id).toEqual(ticket1.id)

    // User #2 got 2 Orders
    const { body: createdOrders2 } = await request(app)
        .get('/api/orders')
        .set('Cookie', cookie2)
        .send()
        .expect(200)
    expect(createdOrders2.length).toEqual(2)
    expect(createdOrders2[0].ticket.id).toEqual(ticket2.id)
    expect(createdOrders2[1].ticket.id).toEqual(ticket3.id)
})

