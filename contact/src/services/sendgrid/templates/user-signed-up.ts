import { Temp, EmailData } from './base/base-temp'

import { TempSubjects } from './subjects'

interface UserSignedUpInt {
    tempSubject: TempSubjects.UserSignedUp
    data: EmailData
}

const data = {
    title: 'Welcome to Zombilet!',
    body: `We are going to love each other more starting from this day!`
}

export class SendEmailForUserSignedUp extends Temp<UserSignedUpInt> {
    readonly tempSubject = TempSubjects.UserSignedUp
    data = data

    constructor(email: string) {
        super(email, data)
    }
}
