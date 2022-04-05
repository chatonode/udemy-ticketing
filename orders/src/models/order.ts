import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { OrderStatus } from '@chato-zombilet/common'
// More Centralized OrderStatus Exporter
export { OrderStatus }

import { TicketDoc } from './ticket'

// Properties to create a new Order Document
interface OrderAttrs {
    userId: string
    status: OrderStatus
    expiresAt: Date
    ticket: TicketDoc
}

// Single Order Document after Creation
interface OrderDoc extends mongoose.Document {
    userId: string
    status: OrderStatus
    expiresAt: Date
    version: number
    ticket: TicketDoc
}

// Entire Order Model
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created,
        },
        expiresAt: {
            type: mongoose.Schema.Types.Date,
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
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
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

/*
    OrderModel Methods
*/
// Any time we want to create a new order; we are not going to call 'new Order()' constructor
// Instead, we are going to use this custom static function as below:
orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
