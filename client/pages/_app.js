import 'bootstrap/dist/css/bootstrap.css'

import buildClient from '../api/build-client'

import Header from '../components/header'


// Custom 'app' that wraps up our imported components
const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser}/>
            {/* <h2>{currentUser && currentUser.email !== null ? currentUser.email : ''}</h2> */}
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    )
}

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx)
    
    const response = await client.get('/api/users/currentuser').catch((error) => {
        console.log(error.message)
    })
    // data -> { currentUser: ... }
    const data = response.data

    // Passing props to sub-components (if getInitialProps is defined)
    let pageProps = {}
    if (appContext.Component.getInitialProps) {
        // Invoking the child component's getInitialProps function (if exists)
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    }

    return {
        pageProps,
        ...data
    }
}

export default AppComponent