import { useState } from 'react'

import Router from 'next/router'

import useRequest from '../../hooks/use-request'

// Component: SignIn
const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Custom Hook: useRequest
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email,
            password
        },
        onSuccess: (data) => Router.push('/')
    })

    const onSubmit = async (event) => {
        event.preventDefault()

        await doRequest()
    }

    return (
        <form onSubmit={onSubmit}>
            <h1>Sign In</h1>
            <div className="form-group">
                <label>E-mail Address</label>
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-control"
                />
            </div>
            <div className="form-group">
               <label>Password</label>
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type="password"
                    className="form-control"
                />
            </div>

            {errors}

            <button className="btn btn-primary">Sign In</button>
        </form>
    )
}

export default SignIn