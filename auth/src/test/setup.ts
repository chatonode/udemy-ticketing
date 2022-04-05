import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo: any

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf'

    mongo = await MongoMemoryServer.create()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri)
})

beforeEach(async () => {
    // All different collections that exist
    const collections = await mongoose.connection.db.collections()

    collections.forEach(async (collection) => {
        // Reset all data
        await collection.deleteMany({})
    })
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})
