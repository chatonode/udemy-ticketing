import request from 'supertest'
import { app } from '../../app'

import { getValidCookie } from '../../test/auth-helper'
import { getValidObjectId } from '../../test/valid-id-generator'

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

it(`returns a '401' if the user is not authenticated`, async () => {
    const orderId = getValidObjectId()
    await request(app).get(`/api/orders/${orderId}`).send().expect(401)
})

it(`returns a status other than '401' if the user is authenticated`, async () => {
    const orderId = getValidObjectId()

    const cookie = await getValidCookie()
    const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', cookie)
        .send()

    expect(response.status).not.toEqual(401)
})

it(`returns a '400' if an invalid orderId is provided`, async () => {
    const orderId = '12345678'

    const cookie = await getValidCookie()
    await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', cookie)
        .send()
        .expect(400)
})

it(`returns a '404' if trying to fetch a non-existing order`, async () => {
    const orderId = getValidObjectId()

    const cookie = await getValidCookie()
    await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', cookie)
        .send()
        .expect(404)
})

it(`returns a '401' if trying to fetch an unowned order`, async () => {
    /* Pre-Conditions */
    // Create 3 Tickets
    const ticket1 = await createTicket('Massive Attack Europe Tour', 59.9)
    const ticket2 = await createTicket('Konya: Techno Hortum Fest', 40)

    // Cookies
    const cookie1 = await getValidCookie()
    const cookie2 = await getValidCookie()

    // Create 1 Order as User #1
    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket1.id,
        })
        .expect(201)

    // Create 1 Order as User #2
    const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket2.id,
        })
        .expect(201)

    /* Assert */
    // User #0(Random) cannot see any orders.
    const cookie0 = await getValidCookie()
    await request(app)
        .get(`/api/orders/${order1.id}`)
        .set('Cookie', cookie0)
        .send()
        .expect(401)
    await request(app)
        .get(`/api/orders/${order2.id}`)
        .set('Cookie', cookie0)
        .send()
        .expect(401)

    // User #1 cannot see any other orders.
    await request(app)
        .get(`/api/orders/${order2.id}`)
        .set('Cookie', cookie1)
        .send()
        .expect(401)

    // User #2 cannot see any other orders.
    await request(app)
        .get(`/api/orders/${order1.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(401)
})

it(`can fetch an individual order for a particular user`, async () => {
    /* Pre-Conditions */
    // Create 3 Tickets
    const ticket1 = await createTicket('Massive Attack Europe Tour', 59.9)
    const ticket2 = await createTicket('Konya: Techno Hortum Fest', 40)
    const ticket3 = await createTicket(
        'Manisa 5972. Geleneksel Mesir Macunu Festivali',
        5.12
    )

    // Cookies
    const cookie1 = await getValidCookie()
    const cookie2 = await getValidCookie()

    // Create 1 Order as User #1
    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie1)
        .send({
            ticketId: ticket1.id,
        })
        .expect(201)

    // Create 2 Orders as User #2
    const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket2.id,
        })
        .expect(201)

    const { body: order3 } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie2)
        .send({
            ticketId: ticket3.id,
        })
        .expect(201)

    /* Assert */
    // User #1 can see its own order.
    const { body: fetchedOrder1 } = await request(app)
        .get(`/api/orders/${order1.id}`)
        .set('Cookie', cookie1)
        .send()
        .expect(200)
    // Assert Order1
    expect(fetchedOrder1.id).toEqual(order1.id)
    expect(fetchedOrder1.ticket.id).toEqual(order1.ticket.id)

    // User #2 can see its own orders.
    const { body: fetchedOrder2 } = await request(app)
        .get(`/api/orders/${order2.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(200)
    // Assert Order2
    expect(fetchedOrder2.id).toEqual(order2.id)
    expect(fetchedOrder2.ticket.id).toEqual(order2.ticket.id)

    const { body: fetchedOrder3 } = await request(app)
        .get(`/api/orders/${order3.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(200)
    // Assert Order3
    expect(fetchedOrder3.id).toEqual(order3.id)
    expect(fetchedOrder3.ticket.id).toEqual(order3.ticket.id)
})
