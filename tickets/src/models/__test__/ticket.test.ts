import mongoose from 'mongoose'
import { Ticket } from '../ticket'

it('increments the version number on multiple saves', async () => {
    /*
        Pre-Conditions
    */
    // Create an instance of a ticket
    const createdTicket = Ticket.build({
        title: 'Devlet Tiyatrosu: Bach Che Lee',
        price: 5,
        userId: '718943489',
    })

    // Save created ticket to the database
    await createdTicket.save()

    // Fetch the created ticket
    const version0Ticket = await Ticket.findById(createdTicket.id)

    // ASSERT: created (AND saved) ticket has 'version: 0'
    expect(version0Ticket!.version).toEqual(0)

    // Skip updating the ticket
    // version0Ticket!.set({ price: 10 })

    // Save the non-updated ticket
    await version0Ticket!.save()
    // Even if we don't update the document, calling .save() function on that instance is going to:
    //  -> increment the 'version'

    // Fetch the non-updated ticket
    const version1Ticket = await Ticket.findById(createdTicket.id)

    // ASSERT: non-updated (BUT saved) ticket has 'version: 1'
    expect(version1Ticket!.version).toEqual(1)

    // Update the ticket
    version1Ticket!.set({ price: 15 })

    // Save the updated ticket
    await version1Ticket!.save()

    // Fetch the updated ticket
    const version2Ticket = await Ticket.findById(createdTicket.id)

    // ASSERT: updated (AND saved) ticket has 'version: 2'
    expect(version2Ticket!.version).toEqual(2)
})

it('implements OCC (optimistic concurrency control)', async () => {
    /*
        Pre-Conditions
    */
    // Create an instance of a ticket
    const createdTicket = Ticket.build({
        title: 'Devlet Tiyatrosu: Bach Che Lee',
        price: 5,
        userId: '718943489',
    })

    // Save the ticket to the database
    await createdTicket.save()

    // Fetch the ticket twice
    const ticket1 = await Ticket.findById(createdTicket.id)
    const ticket2 = await Ticket.findById(createdTicket.id)

    // Modify both tickets
    ticket1!.price = 10
    ticket2!.price = 15

    // Success:     Save the 1st fetched ticket (increments the version number - FROM 1 TO 2)
    await ticket1!.save()

    /*
        Test
    */
    // Error:       Save the 2nd fetched ticket (outdated version number)
    await expect(ticket2!.save()).rejects.toThrowError(mongoose.Error.VersionError);

    // ASSERT: Final ticket has the price of 10
    const ticketFinal = await Ticket.findById(createdTicket.id)
    expect(ticketFinal!.price).toEqual(ticket1!.price)
    expect(ticketFinal!.price).not.toEqual(ticket2!.price)
})
