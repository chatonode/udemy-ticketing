import request from 'supertest'
import { app } from '../../app'

import { getValidCookie } from '../../test/auth-helper'
import { getValidObjectId } from '../../test/valid-id-generator'

import { OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'
import { Subjects } from '@chato-zombilet/common'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, "publish")

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
    await request(app).delete(`/api/orders/${orderId}`).send().expect(401)
})

it(`returns a status other than '401' if the user is authenticated`, async () => {
    const orderId = getValidObjectId()

    const cookie = await getValidCookie()
    const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', cookie)
        .send()

    expect(response.status).not.toEqual(401)
})

it(`returns a '400' if an invalid orderId is provided`, async () => {
    const orderId = '12345678'

    const cookie = await getValidCookie()
    await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', cookie)
        .send()
        .expect(400)
})

it(`returns a '404' if trying to cancel a non-existing order`, async () => {
    const orderId = getValidObjectId()

    const cookie = await getValidCookie()
    await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', cookie)
        .send()
        .expect(404)
})

it(`returns a '401' if trying to cancel an unowned order`, async () => {
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
    // User #0(Random) cannot cancel any orders.
    const cookie0 = await getValidCookie()
    await request(app)
        .delete(`/api/orders/${order1.id}`)
        .set('Cookie', cookie0)
        .send()
        .expect(401)
    await request(app)
        .delete(`/api/orders/${order2.id}`)
        .set('Cookie', cookie0)
        .send()
        .expect(401)

    // User #1 cannot cancel any other orders.
    await request(app)
        .delete(`/api/orders/${order2.id}`)
        .set('Cookie', cookie1)
        .send()
        .expect(401)

    // User #2 cannot cancel any other orders.
    await request(app)
        .delete(`/api/orders/${order1.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(401)
})

it(`can cancel an individual order for a particular user`, async () => {
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
    // User #1 can cancel its own order.
    await request(app)
        .delete(`/api/orders/${order1.id}`)
        .set('Cookie', cookie1)
        .send()
        .expect(204)
    const { body: cancelledOrder1 } = await request(app)
        .get(`/api/orders/${order1.id}`)
        .set('Cookie', cookie1)
        .send()
        .expect(200)
    // Assert Order1
    expect(cancelledOrder1.status).not.toEqual(order1.status)
    expect(cancelledOrder1.status).toEqual(OrderStatus.Cancelled)

    // User #2 can cancel its own orders.
    await request(app)
        .delete(`/api/orders/${order2.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(204)
    const { body: cancelledOrder2 } = await request(app)
        .get(`/api/orders/${order2.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(200)
    // Assert Order2
    expect(cancelledOrder2.status).not.toEqual(order2.status)
    expect(cancelledOrder2.status).toEqual(OrderStatus.Cancelled)

    await request(app)
        .delete(`/api/orders/${order3.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(204)
    const { body: cancelledOrder3 } = await request(app)
        .get(`/api/orders/${order3.id}`)
        .set('Cookie', cookie2)
        .send()
        .expect(200)
    // Assert Order3
    expect(cancelledOrder3.status).not.toEqual(order3.status)
    expect(cancelledOrder3.status).toEqual(OrderStatus.Cancelled)
})

it(`publishes an 'order:cancelled' event`, async () => {
    // Pre-Conditions
    const cookie = await getValidCookie()

    const ticket = Ticket.build({
        id: getValidObjectId(),
        title: 'Return of the King Tribute - Jan 2023',
        price: 29,
    })
    await ticket.save()

    const { body: createdOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        .expect(201)

    // Test
    await request(app)
        .delete(`/api/orders/${createdOrder.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204)

    // Event Assertion
    // // Publisher Invoked: 'order:created' + 'order:cancelled'
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
    // // Event Subject
    const cancelledEventSubject = natsWrapperSpy.mock.calls[1][0]
    expect(cancelledEventSubject).toEqual(Subjects.OrderCancelled)
})
