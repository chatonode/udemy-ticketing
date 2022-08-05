
// Tell Jest to mock that file from '../__mocks__'
jest.mock('../nats-wrapper')

// Tell Jest to mock that npm package from '../__mocks__'
jest.mock('@sendgrid/mail')

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf'

    // For asserting 'from' value of an object, that is sent through 'sgMail.send()' calls
    process.env.SENDGRID_EMAIL = 'somevalidtestemail@sendgrid.com'

})

beforeEach(async () => {
    // Resetting Mock Functions
    jest.clearAllMocks()

})

afterAll(async () => {
    // Resetting onSpy
    jest.restoreAllMocks()

})
