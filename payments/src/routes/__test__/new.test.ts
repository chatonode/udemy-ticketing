import request from 'supertest'
import { app } from '../../app'

import { Subjects, PaymentCreatedEvent } from '@chato-zombilet/common'

import { getValidCookie } from '../../test/auth-helper'
import { getValidObjectId } from '../../test/valid-id-generator'

import { Order, OrderStatus } from '../../models/order'
import { Payment } from '../../models/payment'

/* Fake Imports */
import { stripe } from '../../stripe'
// Charger API Spy
const stripeSpy = jest.spyOn(stripe.charges, 'create') as jest.Mock

import { natsWrapper } from '../../nats-wrapper'
// Event Publisher Spy
const natsWrapperSpy = jest.spyOn(natsWrapper.client, 'publish') as jest.Mock

// Tell Jest to (locally) mock that file from '../__mocks__'
jest.mock('../../stripe')

const createOrder = async (userId?: string) => {
    const id = getValidObjectId()
    const createdOrder = Order.build({
        id,
        userId: userId ? userId : getValidObjectId(),
        status: OrderStatus.Created,
        price: 16.99,
    })
    await createdOrder.save()

    return createdOrder
}

it(`has a route handler listening to '/api/payments' for post requests`, async () => {
    const response = await request(app).post('/api/payments').send({})

    expect(response.status).not.toEqual(404)
})

it(`returns a '401' if the user is not authenticated`, async () => {
    await request(app).post('/api/payments').send({}).expect(401)
})

it(`returns a status other than '401' if the user is authenticated`, async () => {
    const cookie = await getValidCookie()

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({})

    expect(response.status).not.toEqual(401)
})

it(`returns a '400' if an invalid 'token' is provided`, async () => {
    const cookie = await getValidCookie()

    const orderId = getValidObjectId()
    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: '', // Empty string
            orderId,
        })
        .expect(400)

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            // token        // undefined
            orderId,
        })
        .expect(400)
})

it(`returns a '400' if an invalid 'orderId' is provided`, async () => {
    const cookie = await getValidCookie()

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: '1234',
            orderId: '', // Empty string
        })
        .expect(400)

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: '1234',
            // orderId      // undefined
        })
        .expect(400)
})

it(`returns a '404' if trying to pay a non-existing order`, async () => {
    const cookie = await getValidCookie()

    // Create an order before, to be paid
    const order = await createOrder()

    // Delete that order
    await Order.findByIdAndDelete(order.id)

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: '1234',
            orderId: order.id,
        })
        .expect(404)
})

it(`returns a '401' if trying to pay an unowned order`, async () => {
    // Create an anonymous user
    const cookie = await getValidCookie()

    // Create an anonymous order before, to be paid
    const order = await createOrder()

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: '1234',
            orderId: order.id,
        })
        .expect(401)
})

it(`returns a '400' if trying to pay a cancelled order`, async () => {
    // Create a user
    const userId = getValidObjectId()
    const cookie = await getValidCookie(userId)

    // Create an owned order before, to be paid
    const order = await createOrder(userId)

    // Cancel and save that order
    order.status = OrderStatus.Cancelled
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token: '1234',
            orderId: order.id,
        })
        .expect(400)
})

it(`calls the mocked 'charges.create' with valid inputs`, async () => {
    // Create a user
    const userId = getValidObjectId()
    const cookie = await getValidCookie(userId)

    // Create an owned order before, to be paid
    const order = await createOrder(userId)

    const token = '1234'

    await request(app).post('/api/payments').set('Cookie', cookie).send({
        token,
        orderId: order.id,
    })

    // Assert
    expect(stripeSpy).toHaveBeenCalled()
    expect(stripeSpy).toHaveBeenCalledTimes(1)

    const chargeOptions = stripeSpy.mock.calls[0][0]
    expect(chargeOptions.source).toEqual(token)
    expect(chargeOptions.amount).toEqual(order.price * 100)
    expect(chargeOptions.currency).toEqual('gbp')
})

it(`builds the payment and saves it to the database`, async () => {
    // Create a user
    const userId = getValidObjectId()
    const cookie = await getValidCookie(userId)

    // Create an owned order before, to be paid
    const order = await createOrder(userId)

    const token = '1234'

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token,
            orderId: order.id,
        })

    const paymentId = response.body.id

    // Assert
    const payment = await Payment.findOne({
        orderId: order.id,
    })

    expect(payment).not.toBeNull()
    expect(payment!.id).toEqual(paymentId)
    // Hardcoded from 'stripe.ts' mock file
    expect(payment!.stripeId).toEqual('ck_test_320938210938209183901')
})

it(`publishes a 'payment:created' event`, async () => {
    // Create a user
    const userId = getValidObjectId()
    const cookie = await getValidCookie(userId)

    // Create an owned order before, to be paid
    const order = await createOrder(userId)

    const token = '1234'

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token,
            orderId: order.id,
        })

    const paymentId = response.body.id

    // Event Assertion
    // // Publisher Invoked: 'payment-created'
    expect(natsWrapperSpy).toHaveBeenCalled()
    expect(natsWrapperSpy).toHaveBeenCalledTimes(1)
    // // Event Subject
    const createdEventSubject = natsWrapperSpy.mock.calls[0][0]
    expect(createdEventSubject).toEqual(Subjects.PaymentCreated)
    // // Event Data
    const createdEventData: PaymentCreatedEvent['data'] = JSON.parse(natsWrapperSpy.mock.calls[0][1])
    expect(createdEventData.id).toEqual(paymentId)
    expect(createdEventData.orderId).toEqual(order.id)
    // Hardcoded from 'stripe.ts' mock file
    expect(createdEventData.stripeId).toEqual('ck_test_320938210938209183901')
})

it(`returns a '201' if pay a valid order successfully`, async () => {
    // Create a user
    const userId = getValidObjectId()
    const cookie = await getValidCookie(userId)

    // Create an owned order before, to be paid
    const order = await createOrder(userId)

    const token = '1234'

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            token,
            orderId: order.id,
        })
        .expect(201)
})
