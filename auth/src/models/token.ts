import mongoose from 'mongoose'

import jwt from 'jsonwebtoken'

import { UserDoc } from './user'

import { TokenType } from './types/token-type'
// More Centralized TokenType Exporter
export { TokenType }

// An interface that describes the properties
// that are required to create a new Token
interface TokenAttrs {
    user: UserDoc
    value: string
    type: TokenType
    expiresAt: Date
}

// An interface that describes the properties
// that a Token Document has
interface TokenDoc extends mongoose.Document {
    user: UserDoc
    value: string
    type: TokenType
    expiresAt: Date
    // createdAt: string;
    // updatedAt: string;
}


// An interface that describes the properties
// that a Token Model has
interface TokenModel extends mongoose.Model<TokenDoc> {
    build(attrs: TokenAttrs): TokenDoc
}

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: Object.values(TokenType)
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
        required: true
    },
}, {
    toJSON: {
        transform(doc, ret) {
            // _id -> id
            ret.id = ret._id
            delete ret._id

            // __v -> -
            delete ret.__v   //Enabled for not using 'version'
        }
    }
})

/*
    Mongoose Middleware | 'this' refers to Token Document
*/
// Before Saving Token
tokenSchema.pre('save', async function(done) {

    // Mandatory method call while using Async Mongoose
    done()

})

// Any time we want to create a new token; we are not going to call 'new Token()' constructor
// Instead, we are going to use this custom static function as below: 
tokenSchema.statics.build = (attrs: TokenAttrs) => {
    return new Token(attrs)
}

const Token = mongoose.model<TokenDoc, TokenModel>('Token', tokenSchema)

export { Token }