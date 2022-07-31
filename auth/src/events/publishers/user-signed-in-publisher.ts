import { Publisher, Subjects, UserSignedInEvent } from '@chato-zombilet/common'

export class UserSignedInPublisher extends Publisher<UserSignedInEvent> {
    public readonly subject = Subjects.UserSignedIn
}
