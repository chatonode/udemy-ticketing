import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// Properties to create a new Ticket Document
interface TicketAttrs {
    title: string
    price: number
    userId: string
}

// Single Ticket Document after Creation
interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    userId: string
    version: number
    orderId?: string
}

// Entire Ticket Model
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
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
        },
        userId: {
            type: String, // mongoose.Schema.Types.ObjectId,
            required: true,
        },
        orderId: {
            type: String
        }
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

/*
    OCC: updateIfCurrent Plugin
*/
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

/*
    Mongoose Middleware | 'this' refers to Ticket Document
*/
// Before Saving Ticket
// ticketSchema.pre('save', async function(done) {
//     // Implement 'From' Here

//     // Implement 'To' Here

//     // Mandatory method call while using Async Mongoose
//     done()
// })

// Any time we want to create a new ticket; we are not going to call 'new Ticket()' constructor
// Instead, we are going to use this custom static function as below:
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs)
}


const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
