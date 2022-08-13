import { User, UserDoc } from '../../../models/user'

export const getExistingUser = async (userId: string): Promise<UserDoc> => {
    // Fetch user
    const existingUser = await User.findById(userId)
    if (!existingUser) {
        // TODO: Better Error Handling Implementation
        throw new Error('User not found')
    }

    return existingUser
}
