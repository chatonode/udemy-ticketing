import request from 'supertest'
import { app } from '../../app'

import { getValidCookie } from '../../test/auth-helper'

const createTicket = async (title: string, price: number) => {

    const cookie = await getValidCookie()

    return await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        })
}

it(`can fetch an empty list of tickets`, async () => {
    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(0)

})

it(`can fetch a list of tickets`, async () => {
    // Pre-Condition: Create two Tickets
    await createTicket('Massive Attack Europe Tour', 59.90)
    await createTicket('Konya: Techno Hortum Fest', 40)
    await createTicket('Manisa 5972. Geleneksel Mesir Macunu Festivali', 5.12)
    
    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(3)

})
