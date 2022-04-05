import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { OrderStatus } from '@chato-zombilet/common'
// More Centralized OrderStatus Exporter
export { OrderStatus }

// Properties to create a new Order Document
interface OrderAttrs {
    id: string
    // version: string      // Stephen added, but not needed during creation
    userId: string
    status: OrderStatus
    price: number
}

// Single Order Document after Creation
interface OrderDoc extends mongoose.Document {
    // id: string       // Already listed in mongoose.Document interface
    version: number
    userId: string
    status: OrderStatus
    price: number
}

// Entire Order Model
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
    findPreviousVersion(data: FindPreviousVersionParams): Promise<OrderDoc | null>
}

// Params for Finding 'Previous Version' (OCC Query)
interface FindPreviousVersionParams {
    id: string,
    version: number
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
        price: {
            type: Number,
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
// Purpose: https://github.com/chatonode/udemy-notes-microservices/tree/main/19-%20Listening%20for%20Events%20and%20Handling%20Concurrency%20Issues/Q%20%26%20A/%23399-1%20Do%20we%20really%20need%20to%20create%20TicketModel.findByEvent
orderSchema.statics.findPreviousVersion = async (data: FindPreviousVersionParams) => {
    return await Order.findOne({
        _id: data.id,
        version: data.version - 1       // OCC Rule: Preventing Out-Of-Order Processing of Events
    })
}

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,  // id -> _id OR Mongoose assigns '_id' (to store) randomly anyway
        // version: attrs.version,
        userId: attrs.userId,
        status: attrs.status,
        price: attrs.price
    })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
