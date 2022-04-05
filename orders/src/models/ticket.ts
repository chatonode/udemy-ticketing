import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { Order, OrderStatus } from './order'

// Properties to create a new Ticket Document
interface TicketAttrs {
    id: string,
    title: string
    price: number
}

// Single Ticket Document after Creation
export interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    version: number
    isReserved(): Promise<boolean>
}

// Entire Ticket Model
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
    findPreviousVersion(data: FindPreviousVersionParams): Promise<TicketDoc | null>
}

// Params for Finding 'Previous Version' (OCC Query)
interface FindPreviousVersionParams {
    id: string,
    version: number
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                // _id -> id
                ret.id = ret._id
                delete ret._id
            },
        },
    }
)

// Using 'version'
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

// TicketDoc Methods
ticketSchema.methods.isReserved = async function() {
    // this === ticket
    const ticket = this

    // Filter: reserved
    // - ticket is associated with an existing order
    //   - AND
    // - that order has the status of anything but 'Cancelled'
    const existingOrder = await Order.findOne({
        ticket: ticket,
        status: {
            $nin: [
                OrderStatus.Cancelled
            ]
        }
    })

    // Double Flipping: Return true or false
    return !!existingOrder
}

/*
    TicketModel Methods
*/
// Purpose: https://github.com/chatonode/udemy-notes-microservices/tree/main/19-%20Listening%20for%20Events%20and%20Handling%20Concurrency%20Issues/Q%20%26%20A/%23399-1%20Do%20we%20really%20need%20to%20create%20TicketModel.findByEvent
ticketSchema.statics.findPreviousVersion = async (data: FindPreviousVersionParams) => {
    return await Ticket.findOne({
        _id: data.id,
        version: data.version - 1      // OCC Rule: Preventing Out-Of-Order Processing of Events
    })
}

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,  // id -> _id OR Mongoose assigns '_id' (to store) randomly anyway
        title: attrs.title,
        price: attrs.price
    })
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
