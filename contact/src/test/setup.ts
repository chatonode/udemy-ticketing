
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
