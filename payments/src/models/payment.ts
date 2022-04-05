import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// Properties to create a new Payment Document
interface PaymentAttrs {
    orderId: string
    stripeId: string
}

// Single Payment Document after Creation
interface PaymentDoc extends mongoose.Document {
    orderId: string
    stripeId: string
    version: number // Added as a convention
    // No version is required, since:
    // -> a 'payment' just has one state of 'created' inside our app.
}

// Entire Payment Model
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc
}

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            required: true,
            type: String,
        },
        stripeId: {
            required: true,
            type: String
        }
    }, {
        toJSON: {
            transform(doc, ret) {
                // _id -> id
                ret.id = ret._id
                delete ret._id
            }
        }
    }
)

// Using 'version'
paymentSchema.set('versionKey', 'version')
paymentSchema.plugin(updateIfCurrentPlugin)

/*
    PaymentModel Methods
*/
// Any time we want to create a new payment; we are not going to call 'new Payment()' constructor
// Instead, we are going to use this custom static function as below:
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs)
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema)

export { Payment }
