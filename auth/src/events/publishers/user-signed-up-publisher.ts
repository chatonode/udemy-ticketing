import { Publisher, Subjects, UserSignedUpEvent } from '@chato-zombilet/common'

export class UserSignedUpPublisher extends Publisher<UserSignedUpEvent> {
    public readonly subject = Subjects.UserSignedUp
}
