export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({
            id: 'ck_test_320938210938209183901',
            // Further properties can be added to here & tested
        })
    }
}
