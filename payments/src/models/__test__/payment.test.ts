import mongoose from 'mongoose'

import { Payment } from '../payment'

import { getValidObjectId } from '../../test/valid-id-generator'

it('increments the version number on multiple saves', async () => {
    /*
        Pre-Conditions
    */
    // Create an instance of a payment
    const orderId = getValidObjectId()
    const stripeId = getValidObjectId()
    const createdPayment = Payment.build({
        orderId,
        stripeId
    })

    // Save created payment to the database
    await createdPayment.save()

    // Fetch the created payment
    const version0Payment = await Payment.findById(createdPayment.id)

    // ASSERT: created (AND saved) payment has 'version: 0'
    expect(version0Payment!.version).toEqual(0)

    // Skip updating the payment
    // version0Payment!.set({ orderId: getValidObjectId() })

    // Save the non-updated payment
    await version0Payment!.save()
    // Even if we don't update the document, calling .save() function on that instance is going to:
    //  -> increment the 'version'

    // Fetch the non-updated payment
    const version1Payment = await Payment.findById(createdPayment.id)

    // ASSERT: non-updated (BUT saved) payment has 'version: 1'
    expect(version1Payment!.version).toEqual(1)

    // Update the payment
    version1Payment!.set({ orderId: getValidObjectId() })

    // Save the updated payment
    await version1Payment!.save()

    // Fetch the updated payment
    const version2Payment = await Payment.findById(createdPayment.id)

    // ASSERT: updated (AND saved) payment has 'version: 2'
    expect(version2Payment!.version).toEqual(2)
})

it('implements OCC (optimistic concurrency control)', async () => {
    /*
        Pre-Conditions
    */
    // Create an instance of a payment
    const orderId = getValidObjectId()
    const stripeId = getValidObjectId()
    const createdPayment = Payment.build({
        orderId,
        stripeId
    })

    // Save the payment to the database
    await createdPayment.save()

    // Fetch the payment twice
    const payment1 = await Payment.findById(createdPayment.id)
    const payment2 = await Payment.findById(createdPayment.id)

    // Modify both payments
    payment1!.stripeId = '1234'
    payment2!.orderId = getValidObjectId()


    // Success:     Save the 1st fetched payment (increments the version number - FROM 1 TO 2)
    await payment1!.save()

    /*
        Test
    */
    // Error:       Save the 2nd fetched payment (outdated version number)
    await expect(payment2!.save()).rejects.toThrowError(
        mongoose.Error.VersionError
    )

    // ASSERT: Final payment has the status of AwaitingPayment
    const paymentFinal = await Payment.findById(createdPayment.id)
    expect(paymentFinal!.orderId).toEqual(createdPayment.orderId)
    expect(paymentFinal!.stripeId).toEqual(payment1!.stripeId)
    expect(paymentFinal!.stripeId).not.toEqual(payment2!.stripeId)
})
