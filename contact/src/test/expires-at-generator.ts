
export const getExpiresAt = (delayInSeconds: number): string => {
    //     // Time Property
    const DELAY_IN_SECONDS = 1 * delayInSeconds   // Test: x Seconds
    const expirationDate = new Date()
    expirationDate.setSeconds(expirationDate.getSeconds() + DELAY_IN_SECONDS)
    const expiresAt = new Date(expirationDate).toISOString()
    
    return expiresAt
}
