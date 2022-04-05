import { Publisher, Subjects, OrderCancelledEvent } from "@chato-zombilet/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    public readonly subject = Subjects.OrderCancelled
}
