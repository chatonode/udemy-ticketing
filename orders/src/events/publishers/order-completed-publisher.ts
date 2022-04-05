import { Publisher, Subjects, OrderCompletedEvent } from '@chato-zombilet/common'

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
    readonly subject = Subjects.OrderCompleted
}
