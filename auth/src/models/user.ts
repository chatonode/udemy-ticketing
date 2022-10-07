import mongoose from 'mongoose'

import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

import { Password } from '../services/password'

// An interface that describes the properties
// that are required to create a new User
interface UserAttrs {
    email: string
    password: string
}

// An interface that describes the properties
// that a User Document has
export interface UserDoc extends mongoose.Document {
    id: string
    email: string
    password: string
    version: number
    // createdAt: string;
    // updatedAt: string;
}


// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            // _id -> id
            ret.id = ret._id
            delete ret._id

            // password -> -
            delete ret.password

            // __v -> -
            // delete ret.__v   //Disabled for using 'version'
        }
    }
})

// Using 'version'
userSchema.set('versionKey', 'version')
userSchema.plugin(updateIfCurrentPlugin)

/*
    Mongoose Middleware | 'this' refers to User Document
*/
// Before Saving User
userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))

        this.set('password', hashed)
    }

    // Mandatory method call while using Async Mongoose
    done()

})

// Any time we want to create a new user; we are not going to call 'new User()' constructor
// Instead, we are going to use this custom static function as below: 
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }