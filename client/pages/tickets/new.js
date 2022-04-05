import { useState } from 'react'

import Router from 'next/router'

import useRequest from '../../hooks/use-request'

const NewTicket = () => {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')

    // Custom Hook: useRequest
    const { doRequest, errors } = useRequest({
        url: '/api/tickets/',
        method: 'post',
        body: {
            title,
            price
        },
        onSuccess: (ticket) => Router.push(`/tickets/${ticket.id}`)
    })

    const onSubmit = async (event) => {
        event.preventDefault()

        await doRequest()
    }

    // Helper Function: Price Sanitization (€12.53)
    const onBlur = () => {
        // If parseFloat cannot parse the value, it returns NaN
        const floatPrice = parseFloat(price)
        
        if (isNaN(floatPrice)) {
            return
        }

        setPrice(floatPrice.toFixed(2))   // Rounding to correct money format
    }

    // JSX
    return (
        <form onSubmit={onSubmit}>
            <h1>Sell a Ticket</h1>
            <div className="form-group">
                <label>Title</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="form-control"
                />
            </div>
            <div className="form-group">
               <label>Price</label>
                <input
                    value={price}
                    onBlur={onBlur}
                    onChange={e => setPrice(e.target.value)}
                    type="number"
                    className="form-control"
                />
            </div>

            {errors}

            <button className="btn btn-primary">Submit</button>
        </form>
    )
}

export default NewTicket