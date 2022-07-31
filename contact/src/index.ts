import { app } from './app'

const start = async () => {
    console.log('Starting...')
    
    // Env: JWT_KEY exists (to be able to use 'process.env.JWT_KEY!')
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined.')
    }


    try {


    } catch (err) {
        console.error(err)
    }

    const PORT = 3000

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`)
    })
}

start()
