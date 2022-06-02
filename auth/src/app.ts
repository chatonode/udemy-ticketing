import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError } from '@chato-zombilet/common'

import { signUpRouter } from './routes/sign-up'
import { signInRouter } from './routes/sign-in'
import { signOutRouter } from './routes/sign-out'
import { currentUserRouter } from './routes/current-user'

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

// Route Handler
app.use(signUpRouter)
app.use(signInRouter)
app.use(signOutRouter)
app.use(currentUserRouter)

// 'Handler Not Found' for all HTTP Methods
app.all('*', async () => {
    throw new NotFoundError()
})

// Middleware
app.use(errorHandler)

export { app }