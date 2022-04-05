import request from 'supertest'
import { app } from '../../app'

import { getValidCookie } from '../../test/auth-helper'
import { Ticket } from '../../models/ticket'

// It is STILL going to import fake natsWrapper
import { natsWrapper } from '../../nats-wrapper'

it(`has a route handler listening to '/api/tickets' for post requests`, async () => {
    const response = await request(app).post('/api/tickets').send({})

    expect(response.status).not.toEqual(404)
})

it(`returns a '401' if the user is not authenticated`, async () => {
    await request(app).post('/api/tickets').send({}).expect(401)
})

it(`returns a status other than '401' if the user is authenticated`, async () => {
    const cookie = await getValidCookie()

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({})

    expect(response.status).not.toEqual(401)
})

it(`returns a '400' if an invalid title is provided`, async () => {
    const cookie = await getValidCookie()

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 10,
        })
        .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            price: 10,
        })
        .expect(400)
})

it(`returns a '400' if an invalid price is provided`, async () => {
    const cookie = await getValidCookie()

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Pink Floyd',
            price: -10,
        })
        .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Pink Floyd',
        })
        .expect(400)
})

it(`creates a ticket with valid inputs`, async () => {
    // 0 Tickets
    const numberOfTicketsBefore = await Ticket.count()

    const cookie = await getValidCookie()

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Pink Floyd',
            price: 25.4,
        })
        .expect(201)

    const numberOfTicketsAfter = await Ticket.count()

    expect(numberOfTicketsAfter).toEqual(numberOfTicketsBefore + 1)
})

it(`publishes a 'ticket:created' event`, async () => {
    // Assert 0 Tickets
    const numberOfTicketsBefore = await Ticket.count()

    const cookie = await getValidCookie()

    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Pink Floyd',
            price: 25.4,
        })
        .expect(201)

    // Assert 1 Ticket
    const numberOfTicketsAfter = await Ticket.count()

    expect(numberOfTicketsAfter).toEqual(numberOfTicketsBefore + 1)

    // Event Assertion
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
