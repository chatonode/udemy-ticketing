import { Message, Stan } from 'node-nats-streaming'
import { BaseEvent } from './base-event'

// Abstract Listener Class
export abstract class Listener<T extends BaseEvent> {
    abstract subject: T['subject']
    abstract queueGroupName: string
    abstract onMessage(data: T['data'], msg: Message): void

    private client: Stan

    // 'protected': So, subclasses can re-define this default value.
    protected ackWait = 5 * 1000    // Default: 5 seconds - STAN Default: 30 seconds

    constructor(client: Stan) {
        this.client = client
    }

    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDeliverAllAvailable()
            .setDurableName(this.queueGroupName)
    }

    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        )

        subscription.on('message', (msg: Message) => {
            console.log(
                `Message received FROM: ${this.subject} / ${this.queueGroupName}`
            )

            const parsedData = this.parseMessage(msg)
            this.onMessage(parsedData, msg)
        })
    }

    parseMessage(msg: Message) {
        const data = msg.getData()

        // Type Check for making TS happy about that we are working with string (NOT Buffer)
        return typeof data === 'string'
            ? JSON.parse(data)                      // string
            : JSON.parse(data.toString('utf8'))     // Buffer
    }
}
