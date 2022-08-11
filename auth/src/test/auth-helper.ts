import request from 'supertest'
import { app } from '../app'
import { getValidObjectId } from './valid-id-generator'

const getValidCookie = async (id?: string) => {
    const idOrNewId = id ? id : getValidObjectId()     // if provided ? id  : else new Id
    const email = `test.${idOrNewId}@test.com`
    const password = 'Password123'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password
        })
        .expect(201)

    const cookie = response.get('Set-Cookie')

    return cookie
}

export { getValidCookie }