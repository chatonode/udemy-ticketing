import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// Properties to create a new User Document
interface UserAttrs {
    id: string,
    email: string
}

// Single User Document after Creation
export interface UserDoc extends mongoose.Document {
    id: string
    email: string
    version: number
}

// Entire User Model
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
    findPreviousVersion(data: FindPreviousVersionParams): Promise<UserDoc | null>
}

// Params for Finding 'Previous Version' (OCC Query)
interface FindPreviousVersionParams {
    id: string,
    version: number
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
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
userSchema.set('versionKey', 'version')
userSchema.plugin(updateIfCurrentPlugin)

/*
    UserModel Methods
*/
// Purpose: https://github.com/chatonode/udemy-notes-microservices/tree/main/19-%20Listening%20for%20Events%20and%20Handling%20Concurrency%20Issues/Q%20%26%20A/%23399-1%20Do%20we%20really%20need%20to%20create%20TicketModel.findByEvent
userSchema.statics.findPreviousVersion = async (data: FindPreviousVersionParams) => {
    return await User.findOne({
        _id: data.id,
        version: data.version - 1      // OCC Rule: Preventing Out-Of-Order Processing of Events
    })
}

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User({
        _id: attrs.id,  // id -> _id OR Mongoose assigns '_id' (to store) randomly anyway
        email: attrs.email
    })
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
