import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@chato-zombilet/common'

// import Route Handler
import { createChargeRouter } from './routes/new'

const app = express()
app.set('trust proxy', true)    // Traffic is being proxied by Ingress NGINX
app.use(express.json())
app.use(cookieSession({
    signed: false,                              // Disabling 'cookie encryption'

    // HTTPS switched on for dev
    secure: process.env.NODE_ENV !== 'test'     // Enabling 'required HTTPS connection' (if NODE_ENV !== 'test')

    // HTTPS switched off for production
    // secure: false
}))

// After cookieSession middleware:
// Global currentUser middleware
app.use(currentUser)

// Route Handler
app.use(createChargeRouter)

// 'Handler Not Found' for all HTTP Methods
app.all('*', async () => {
    throw new NotFoundError()
})

// Middleware
app.use(errorHandler)

export { app }
