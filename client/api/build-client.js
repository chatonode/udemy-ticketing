import axios from 'axios'

// Local
// const ingressNginxURL = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'

// Prod
const ingressNginxURL = 'http://www.zombilet.xyz'

const buildClient = ({ req }) => {
    // Server || Browser
    if (typeof window === 'undefined') {
        // We are on the server!

        return axios.create({
            baseURL: ingressNginxURL,
            headers: req.headers
        })
    } else {
        // We are on the browser!

        return axios.create({})
    }
}

export default buildClient