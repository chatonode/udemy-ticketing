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

export const getExistingUserWithVersion =  async (userId: string, userVersion: number): Promise<UserDoc> => {
    // Fetch user
    const existingUser = await User.findOne({
        id: userId,
        version: userVersion
    })
    if (!existingUser) {
        // TODO: Better Error Handling Implementation
        throw new Error('User not found with this version')
    }

    return existingUser
}
