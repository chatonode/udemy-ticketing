import nats, { Stan, StanOptions } from 'node-nats-streaming'

class NatsWrapper {
    private _client?: Stan

    // Getter(TypeScript) for Preventing Re-Assignation & Unassignation
    get client() {
        if (!this._client) {
            throw new Error('Cannot access NATS client before connecting!')
        }

        return this._client
    }

    connect(clusterID: string, clientID: string, opts?: StanOptions): Promise<void> {
        this._client = nats.connect(clusterID, clientID, opts)

        return new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to STAN...')

                resolve()
            })

            this.client.on('error', (err) => {
                reject(err)
            })
        })
    }
}

export const natsWrapper = new NatsWrapper()
