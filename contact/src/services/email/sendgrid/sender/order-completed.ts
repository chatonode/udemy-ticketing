import { SendingReasons } from '../../base/base-sender'

import { Sender } from './sender'
import { OrderCompletedInt } from '../interface/order-completed-int'

export class SendEmailForOrderCompleted extends Sender<OrderCompletedInt> {
    protected readonly sendingReason = SendingReasons.OrderCompleted
    protected data: OrderCompletedInt['data']

    protected getData = (eventData: OrderCompletedInt['eventData']): OrderCompletedInt['data'] => {
        const titleOrderCompleted = `Order Completed | Zombilet`
        const bodyOrderCompleted = `
                                        Hi there! We have some news related to you:

                                        An order has been completed with your account. You can see the details listed as below:

                                        - Owner ID: ${eventData.userId}
                                        - Order ID: ${eventData.orderId}
                                        - Order Status: ${eventData.orderStatus}
            
                                        If this order does not belong to you, please contact us immediately at help@zombilet.com.

                                    `

        const data = {
            title: titleOrderCompleted,
            body: bodyOrderCompleted,
        }

        return data
    }

    constructor(email: string, eventData: OrderCompletedInt['eventData']) {
        super()
        this.data = this.getData(eventData)

        this.sendEmailTo(email)
    }
}
