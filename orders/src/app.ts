import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@chato-zombilet/common'

// import Route Handler
import { createOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'
import { showAllOrdersRouter } from './routes/index'
import { cancelOrderRouter } from './routes/cancel'

const app = express()
app.set('trust proxy', true)    // Traffic is being proxied by Ingress NGINX
app.use(express.json())
app.use(cookieSession({
    signed: false,                              // Disabling 'cookie encryption'
    secure: process.env.NODE_ENV !== 'test'     // Enabling 'required HTTPS connection' (if NODE_ENV !== 'test') 
}))

// After cookieSession middleware:
// Global currentUser middleware
app.use(currentUser)

// Route Handler
app.use(createOrderRouter)
app.use(showOrderRouter)
app.use(showAllOrdersRouter)
app.use(cancelOrderRouter)

// 'Handler Not Found' for all HTTP Methods
app.all('*', async () => {
    throw new NotFoundError()
})

// Middleware
app.use(errorHandler)

export { app }