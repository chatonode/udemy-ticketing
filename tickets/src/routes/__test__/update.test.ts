import request from 'supertest'
import { app } from '../../app'

import { getValidObjectId } from '../../test/valid-id-generator'
import { getValidCookie } from '../../test/auth-helper'
import { Ticket } from '../../models/ticket'

import { natsWrapper } from '../../nats-wrapper'

it(`returns a '401' if the user is not authenticated`, async () => {
    const id = getValidObjectId()

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'Mevlana-i Anmalar vs. vs.',
            price: 3.35,
        })
        .expect(401)
})

it(`returns a '404' if the ticket is not found`, async () => {
    const cookie = await getValidCookie()

    const id = getValidObjectId()
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Mevlana-i Anmalar vs. vs.',
            price: 3.35,
        })
        .expect(404)
})

it(`returns a '401' if the ticket is not owned by current user`, async () => {
    // User1
    const cookie1 = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie1)
        .send({
            title: 'Mevlana-i Anmalar vs. vs.',
            price: 3.35,
        })
        .expect(201)

    const id = response1.body.id

    // User2
    const cookie2 = await getValidCookie()

    // Update Unowned Ticket
    const response2 = await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie2)
        .send({
            title: 'Mevlana-i Anmalar v2.27',
            price: 150,
        })

    expect(response2.statusCode).toEqual(401)

    // DB Check
    const tickets = await Ticket.find()

    const unownedTicket = tickets[0]

    expect(unownedTicket.title).toEqual('Mevlana-i Anmalar vs. vs.')
    expect(unownedTicket.title).not.toEqual('Mevlana-i Anmalar v2.27')
    expect(unownedTicket.price).toEqual(3.35)
    expect(unownedTicket.price).not.toEqual(150)
})

it(`returns a '400' if a ticket is reserved`, async () => {
    const cookie = await getValidCookie()

    /* Pre-Conditions */
    // Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // Fetch, Reserve, and Save that Created Ticket
    const ticket = await Ticket.findById(id)
    const orderId = getValidObjectId()
    ticket!.set({ orderId })
    await ticket!.save()

    // Test: Update Price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2023 Live!',
            price: 1500
        })
        .expect(400)

    // Assert: DB Check
    const tickets = await Ticket.find()

    const reservedTicket = tickets[0]

    expect(reservedTicket.title).toEqual('BlizzCon 2022 Live!')
    expect(reservedTicket.price).toEqual(10)
    expect(reservedTicket.version).toEqual(ticket!.version)
})

it(`returns a '400' if no properties are provided`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // no title & no price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({})
        .expect(400)

    // DB Check
    const tickets = await Ticket.find()

    const unchangedTicket = tickets[0]

    expect(unchangedTicket.title).toEqual('BlizzCon 2022 Live!')
    expect(unchangedTicket.price).toEqual(10)
})

it(`returns a '400' if non-existing properties are provided`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // non-existing properties
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            summary: 'BlizzCon 2023 Live!',
            expense: 15,
        })
        .expect(400)

    // DB Check
    const tickets = await Ticket.find()

    const unchangedTicket = tickets[0]

    expect(unchangedTicket.title).toEqual('BlizzCon 2022 Live!')
    expect(unchangedTicket.price).toEqual(10)
})


// Test Case is Ready
// TODO | Implementation: 400 when Extra Properties Provided
// it(`returns a '400' if non-existing properties with valid title and valid price are provided`, async () => {
//     const cookie = await getValidCookie()

//     // Pre-Condition: Create a Ticket
//     const response1 = await request(app)
//         .post('/api/tickets')
//         .set('Cookie', cookie)
//         .send({
//             title: 'BlizzCon 2022 Live!',
//             price: 10,
//         })
//         .expect(201)

//     const id = response1.body.id

//     // valid title & valid price & non-existing properties
//     const ress = await request(app)
//         .put(`/api/tickets/${id}`)
//         .set('Cookie', cookie)
//         .send({
//             logId: 1234,
//             title: 'BlizzCon 2023 Live!',
//             price: 15,
//             deliveredSometime: true,
//         })
//         // .expect(400)

//     console.log('RESSS', ress.body)

//     // DB Check
//     const tickets = await Ticket.find()

//     const unchangedTicket = tickets[0]

//     expect(unchangedTicket.title).toEqual('BlizzCon 2022 Live!')
//     expect(unchangedTicket.price).toEqual(10)
// })

it(`returns a '400' if an invalid title is provided`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // invalid title
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
        })
        .expect(400)

    // invalid title & valid price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 15,
        })
        .expect(400)

    // DB Check
    const tickets = await Ticket.find()

    const unchangedTicket = tickets[0]

    expect(unchangedTicket.title).toEqual('BlizzCon 2022 Live!')
    expect(unchangedTicket.title).not.toEqual('')
    expect(unchangedTicket.price).toEqual(10)
    expect(unchangedTicket.price).not.toEqual(15)
})

it(`returns a '400' if an invalid price is provided`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // invalid price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            price: -10,
        })
        .expect(400)

    // valid title & invalid price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2023 Live!',
            price: -10,
        })
        .expect(400)

    // DB Check
    const tickets = await Ticket.find()

    const unchangedTicket = tickets[0]

    expect(unchangedTicket.title).toEqual('BlizzCon 2022 Live!')
    expect(unchangedTicket.title).not.toEqual('BlizzCon 2023 Live!')
    expect(unchangedTicket.price).toEqual(10)
    expect(unchangedTicket.price).not.toEqual(-10)
})

it(`returns a '400' if invalid title and price are provided`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // invalid title & invalid price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: -10,
        })
        .expect(400)

    // DB Check
    const tickets = await Ticket.find()

    const unchangedTicket = tickets[0]

    expect(unchangedTicket.title).toEqual('BlizzCon 2022 Live!')
    expect(unchangedTicket.title).not.toEqual('')
    expect(unchangedTicket.price).toEqual(10)
    expect(unchangedTicket.price).not.toEqual(-10)
})

// Test Case is Ready
// TODO | Implementation: 200 when Only Title Provided
// it(`updates a ticket with valid title`, async () => {
//     const cookie = await getValidCookie()

//     // Pre-Condition: Create a Ticket
//     const response1 = await request(app)
//         .post('/api/tickets')
//         .set('Cookie', cookie)
//         .send({
//             title: 'BlizzCon 2022 Live!',
//             price: 10,
//         })
//         .expect(201)

//     const id = response1.body.id

//     // valid title
//     await request(app)
//         .put(`/api/tickets/${id}`)
//         .set('Cookie', cookie)
//         .send({
//             title: 'BlizzCon 2023 Live!',
//         })
//         .expect(200)

//     // DB Check
//     const tickets = await Ticket.find()

//     const changedTicket = tickets[0]

//     expect(changedTicket.title).toEqual('BlizzCon 2023 Live!')
//     expect(changedTicket.price).toEqual(10)
// })


// Test Case is Ready
// TODO | Implementation: 200 when Only Price Provided
// it(`updates a ticket with valid price`, async () => {
//     const cookie = await getValidCookie()

//     // Pre-Condition: Create a Ticket
//     const response1 = await request(app)
//         .post('/api/tickets')
//         .set('Cookie', cookie)
//         .send({
//             title: 'BlizzCon 2022 Live!',
//             price: 10,
//         })
//         .expect(201)

//     const id = response1.body.id

//     // valid price
//     await request(app)
//         .put(`/api/tickets/${id}`)
//         .set('Cookie', cookie)
//         .send({
//             price: 15,
//         })
//         .expect(200)

//     // DB Check
//     const tickets = await Ticket.find()

//     const changedTicket = tickets[0]

//     expect(changedTicket.title).toEqual('BlizzCon 2022 Live!')
//     expect(changedTicket.price).toEqual(15)
// })

it(`updates a ticket with valid title and price`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // valid title & valid price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2023 Live!',
            price: 15,
        })
        .expect(200)

    // DB Check
    const tickets = await Ticket.find()

    const changedTicket = tickets[0]

    expect(changedTicket.title).toEqual('BlizzCon 2023 Live!')
    expect(changedTicket.price).toEqual(15)
})

it(`publishes a 'ticket:updated' event`, async () => {
    const cookie = await getValidCookie()

    // Pre-Condition: Create a Ticket
    const response1 = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2022 Live!',
            price: 10,
        })
        .expect(201)

    const id = response1.body.id

    // valid title & valid price
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: 'BlizzCon 2023 Live!',
            price: 15,
        })
        .expect(200)

    // Event Assertion
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
})