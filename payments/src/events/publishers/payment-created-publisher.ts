import { Publisher, Subjects, PaymentCreatedEvent } from '@chato-zombilet/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
}
