import { Publisher, Subjects, UserForgotPasswordEvent } from '@chato-zombilet/common'

export class UserForgotPasswordPublisher extends Publisher<UserForgotPasswordEvent> {
    public readonly subject = Subjects.UserForgotPassword
}
