import Link from 'next/link'

import Router from 'next/router'

import useRequest from '../../hooks/use-request'

// Component
const ShowTicket = ({ currentUser, ticket }) => {
    // Custom Hook: useRequest
    const { doRequest, errors } = useRequest({
        url: '/api/orders/',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            
            {errors}

            <button 
                className="btn btn-primary"
                onClick={() => doRequest()} // Wrapping it up with an arrow function prevents 'sending event'
            >Purchase</button>
        </div>
    )
}

// Server Side Rendering Method
ShowTicket.getInitialProps = async (context, client, currentUser) => {

    const { ticketId } = context.query

    const { data: ticket } = await client.get(`/api/tickets/${ticketId}`).catch((error) => {
        console.log(error.message)
    })

    return { ticket }
}

export default ShowTicket
