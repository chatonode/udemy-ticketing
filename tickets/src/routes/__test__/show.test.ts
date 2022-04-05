import request from 'supertest'
import { app } from '../../app'

import { getValidObjectId } from '../../test/valid-id-generator'
import { getValidCookie } from '../../test/auth-helper'

it(`returns a '404' if the ticket is not found`, async () => {
    const id = getValidObjectId()

    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404)
})

it(`returns the ticket if the ticket is found`, async () => {
    // Pre-Condition: Create a Ticket
    const title = 'Massive Attack London Tour'
    const price = 35

    const cookie = await getValidCookie()

    const resCreate = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        })
        .expect(201)
    
    const { id } = resCreate.body

    const resGet = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(200)

    expect(resGet.body.id).toEqual(id)
    expect(resGet.body.title).toEqual(title)
    expect(resGet.body.price).toEqual(price)
})