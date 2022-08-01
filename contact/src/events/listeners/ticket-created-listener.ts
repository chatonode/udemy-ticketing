import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketCreatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
    queueGroupName = queueGroupName

    async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
        const {  } = data

        console.log('TICKET CREATED: ', data)

        msg.ack()
    }
}