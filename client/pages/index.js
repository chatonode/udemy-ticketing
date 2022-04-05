import Link from 'next/link'

// Component
const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a>{ticket.title}</a>
                    </Link>
                </td>
                <td>£ {ticket.price}</td>
                <td>{ticket.orderId ? 'X' : '\u2713'}</td>
            </tr>
        )
    })

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        
                        <th>Price</th>

                        <th>Available</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
}

// Server Side Rendering Method
LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data: tickets } = await client.get('/api/tickets').catch((error) => {
        console.log(error.message)
    })

    return { tickets }
}

export default LandingPage
