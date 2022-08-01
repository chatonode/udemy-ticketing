import { Message } from 'node-nats-streaming'

import { Listener, Subjects, TicketUpdatedEvent } from '@chato-zombilet/common'

import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
        const {  } = data

        console.log('TICKET UPDATED: ', data)

        msg.ack()
    }
}