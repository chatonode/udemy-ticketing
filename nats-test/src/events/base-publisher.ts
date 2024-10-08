import { Stan } from 'node-nats-streaming'
import { BaseEvent } from './base-event'


// Abstract Publisher Class
export abstract class Publisher<T extends BaseEvent> {
    abstract subject: T['subject']

    private client: Stan

    constructor(client: Stan) {
        this.client = client
    }

    publish(data: T['data']): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.publish(
                this.subject,
                JSON.stringify(data),
                (err, guid) => {
                    // err not null
                    if (err) {
                        return reject(err)
                    }

                    console.log(`Event published TO: ${this.subject}`)
                    resolve()
                }
            )
        })
    }
}
