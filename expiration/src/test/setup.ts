
// Tell Jest to mock that file from '../__mocks__'
jest.mock('../nats-wrapper')

// beforeAll(async () => {

// })

beforeEach(async () => {
    // Resetting Mock Functions
    jest.clearAllMocks()
})

// afterAll(async () => {

// })
