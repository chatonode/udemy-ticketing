import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { OrderCreatedInt } from '../interface/order-created-int'

export class SendEmailForOrderCreated extends Sender<OrderCreatedInt> {
    protected readonly sendingReason = SendingReasons.OrderCreated
    protected data: OrderCreatedInt['data']

    protected getData = (eventData: OrderCreatedInt['eventData']): OrderCreatedInt['data'] => {
        const titleOrderCreated = `Order Created | Zombilet`
        const bodyOrderCreated = `
                                        Hi there! We have some news related to you:

                                        An order has been placed with your account. You can see the details listed as below:

                                        - Owner ID: ${eventData.userId}
                                        - Order ID: ${eventData.orderId}
                                        - Order Status: ${eventData.orderStatus}
                                        - Order Expires At: ${new Date(eventData.orderExpiresAt).getTime()}
                                        - Ticket ID: ${eventData.ticketId}
                                        - Ticket Price: ${eventData.ticketPrice}
            
                                        If this order does not belong to you, please contact us immediately at help@zombilet.com.

                                    `

        const data = {
            title: titleOrderCreated,
            body: bodyOrderCreated,
        }

        return data
    }

    constructor(email: string, eventData: OrderCreatedInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
