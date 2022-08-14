import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { OrderCancelledInt } from '../interface/order-cancelled-int'

export class SendEmailForOrderCancelled extends Sender<OrderCancelledInt> {
    protected readonly sendingReason = SendingReasons.OrderCancelled
    protected data: OrderCancelledInt['data']

    protected getData = (eventData: OrderCancelledInt['eventData']): OrderCancelledInt['data'] => {
        const titleOrderCancelled = `Order Cancelled | Zombilet`
        const bodyOrderCancelled = `
                                        Hi there! We have some news related to you:

                                        An order has been cancelled with your account. You can see the details listed as below:

                                        - Owner ID: ${eventData.userId}
                                        - Order ID: ${eventData.orderId}
                                        - Order Status: ${eventData.orderStatus}
            
                                        If this order does not belong to you, please contact us immediately at help@zombilet.com.

                                    `

        const data = {
            title: titleOrderCancelled,
            body: bodyOrderCancelled,
        }

        return data
    }

    constructor(email: string, eventData: OrderCancelledInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
