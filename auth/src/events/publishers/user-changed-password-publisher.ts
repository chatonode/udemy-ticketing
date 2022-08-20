import { Publisher, Subjects, UserChangedPasswordEvent } from '@chato-zombilet/common'

export class UserChangedPasswordPublisher extends Publisher<UserChangedPasswordEvent> {
    public readonly subject = Subjects.UserChangedPassword
}
