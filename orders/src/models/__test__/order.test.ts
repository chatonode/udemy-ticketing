import mongoose from 'mongoose'
import { Order, OrderStatus } from '../order'
import { Ticket } from '../ticket'

import { getValidObjectId } from '../../test/valid-id-generator'

it('increments the version number on multiple saves', async () => {
    /*
        Pre-Conditions
    */
    // Create a ticket and save it
    const ticketId = getValidObjectId()
    const ticket = Ticket.build({
        id: ticketId,
        title: 'Devlet Tiyatrosu: Bach Che Lee',
        price: 5,
    })
    await ticket.save()

    // Create an instance of an order
    const userId = getValidObjectId()
    const createdOrder = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    })

    // Save created order to the database
    await createdOrder.save()

    // Fetch the created order
    const version0Order = await Order.findById(createdOrder.id)

    // ASSERT: created (AND saved) order has 'version: 0'
    expect(version0Order!.version).toEqual(0)

    // Skip updating the order
    // version0Order!.set({ status: OrderStatus.AwaitingPayment })

    // Save the non-updated order
    await version0Order!.save()
    // Even if we don't update the document, calling .save() function on that instance is going to:
    //  -> increment the 'version'

    // Fetch the non-updated order
    const version1Order = await Order.findById(createdOrder.id)

    // ASSERT: non-updated (BUT saved) order has 'version: 1'
    expect(version1Order!.version).toEqual(1)

    // Update the order
    version1Order!.set({ status: OrderStatus.Cancelled })

    // Save the updated order
    await version1Order!.save()

    // Fetch the updated order
    const version2Order = await Order.findById(createdOrder.id)

    // ASSERT: updated (AND saved) order has 'version: 2'
    expect(version2Order!.version).toEqual(2)
})

it('implements OCC (optimistic concurrency control)', async () => {
    /*
        Pre-Conditions
    */
    // Create a ticket and save it
    const ticketId = getValidObjectId()
    const ticket = Ticket.build({
        id: ticketId,
        title: 'Devlet Tiyatrosu: Bach Che Lee',
        price: 5,
    })
    await ticket.save()

    // Create an instance of an order
    const userId = getValidObjectId()
    const createdOrder = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    })

    // Save the order to the database
    await createdOrder.save()

    // Fetch the order twice
    const order1 = await Order.findById(createdOrder.id)
    const order2 = await Order.findById(createdOrder.id)

    // Modify both orders
    order1!.status = OrderStatus.AwaitingPayment
    order2!.status = OrderStatus.Cancelled

    // Success:     Save the 1st fetched order (increments the version number - FROM 1 TO 2)
    await order1!.save()

    /*
        Test
    */
    // Error:       Save the 2nd fetched order (outdated version number)
    await expect(order2!.save()).rejects.toThrowError(
        mongoose.Error.VersionError
    )

    // ASSERT: Final order has the status of AwaitingPayment
    const orderFinal = await Order.findById(createdOrder.id)
    expect(orderFinal!.status).toEqual(order1!.status)
    expect(orderFinal!.status).not.toEqual(order2!.status)
})
