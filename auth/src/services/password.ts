import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

// From Callback-based into Promise-based implementation support
const scryptAsync = promisify(scrypt)

export class Password {
    static async toHash(password: string) {
        // Generate a 'salt'
        const salt = randomBytes(8).toString('hex')

        // Hash the 'password' along with the 'salt'
        const buf = (await scryptAsync(password, salt, 64)) as Buffer

        // Return 'hashed password' and 'salt' concatenated together, joined by '.'
        return `${buf.toString('hex')}.${salt}`
    }

    static async compare(storedPassword: string, suppliedPassword: string) {
        // Destructure 'hashed password' and 'salt' stored in the MongoDB 
        const [hashedPassword, salt] = storedPassword.split('.')

        // Hash the 'incoming password' with the same 'salt'
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer

        // Compare each 'hashed passwords' are equal
        return buf.toString('hex') === hashedPassword
    }
}