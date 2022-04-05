import { Publisher, Subjects, ExpirationCompletedEvent } from '@chato-zombilet/common'

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationCompleted
}
