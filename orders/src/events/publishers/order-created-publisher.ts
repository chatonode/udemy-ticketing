import { Publisher, Subjects, OrderCreatedEvent } from '@chato-zombilet/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    public readonly subject = Subjects.OrderCreated
}
