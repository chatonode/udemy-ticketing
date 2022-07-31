
// Tell Jest to mock that file from '../__mocks__'
jest.mock('../nats-wrapper')

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf'

})

beforeEach(async () => {
    // Resetting Mock Functions
    jest.clearAllMocks()

})

afterAll(async () => {
    // Resetting onSpy
    jest.restoreAllMocks()

})
