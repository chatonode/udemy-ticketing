import { useEffect, useState } from 'react'

import Router from 'next/router'

import StripeCheckout from 'react-stripe-checkout'

import useRequest from '../../hooks/use-request'


// Component
const ShowOrder = ({ currentUser, order }) => {
    const { id: orderId, expiresAt, ticket } = order

    const [timeLeft, setTimeLeft] = useState(0)

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId
        },
        onSuccess: (id) => Router.push('/orders')
    })

    const findTimeLeft = () => {
        const secondsLeft = Math.floor((new Date(expiresAt) - new Date()) / 1000)
    
        setTimeLeft(secondsLeft)
    }

    useEffect(() => {
        // Initial Timer
        findTimeLeft()

        // Interval(Wait and Run) per 1 Second
        const intervalId = setInterval(findTimeLeft, 1000)

        // Stopping Interval
        return () => clearInterval(intervalId)

    }, [])      // [] | It is going to be run only one time when component appears.


    // Order Expired
    if (timeLeft < 0) {
        return (
            <div>
                <h1>Order Expired</h1>
                <h3>:(</h3>
                <h5>Your order of '{ticket.title}' for £{ticket.price} has been expired.</h5>
            </div>
        )
    }

    // Stripe Payment
    const onToken = async (token) => {
        const paymentId = await doRequest({ token: token.id })

        console.log('onToken', paymentId)
    }

    return (
        <div>
            <h1>Order in Progress..</h1>
            <h3>{timeLeft} seconds left</h3>
            <h5>Your order of '{ticket.title}' for £{ticket.price} has been created.</h5>
            <div>
                <StripeCheckout
                    token={onToken}
                    stripeKey="pk_test_51KjUSCAKrVWt2vi4PR02i72BOSsKClWIJiqfeaL7cUk8fnpX3nVN8YH3SzxymMjv4nwYFUfnx56xv46tFZRX2EGf00KzG6wJQ1"
                    amount={ticket.price * 100}
                    email={currentUser.email}
                    currency="GBP"
                />
            </div>

            {errors}

        </div>
    )

}

// Server Side Rendering Method
ShowOrder.getInitialProps = async (context, client, currentUser) => {

    const { orderId } = context.query

    const { data: order } = await client.get(`/api/orders/${orderId}`).catch((error) => {
        console.log(error.message)
    })

    return { order }
}

export default ShowOrder
