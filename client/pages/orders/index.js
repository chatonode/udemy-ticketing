
const ShowMyOrders = ({ currentUser, orders }) => {

    const orderList = orders.map((order) => {
        return (
            <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.ticket.title}</td>
                <td>£ {order.ticket.price}</td>
                <td>{order.status.toUpperCase()}</td>
            </tr>
        )
    })

    return (
        <div>
            <h1>My Orders</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Order ID</th>

                        <th>Ticket</th>
                        
                        <th>Price</th>

                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList}
                </tbody>
            </table>
        </div>
    )
}

ShowMyOrders.getInitialProps = async (context, client, currentUser) => {
    const { data: orders } = await client.get('/api/orders').catch((error) => {
        console.log(error.message)
    })

    return { orders }
}

export default ShowMyOrders
