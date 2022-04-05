import Link from 'next/link'

const Header = ({ currentUser }) => {

    // Trick to conditionally show the content based upon single filtering criteria
    const links = [
        currentUser && { label: 'Sell a Ticket', href: '/tickets/new' },
        currentUser && { label: 'My Orders', href: '/orders' },
        
        // Auth
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ]
    .filter(linkConfig => linkConfig)
    .map(({ label, href }) => {
        return (
            <li key={href} className="nav-item">
                <Link href={href}>
                    <a className="nav-link">{label}</a>
                </Link>
            </li>
        )
    })

    // [false, false, { label: 'Sign Out', href: '/auth/signout' }]
    //      OR
    // [{ label: 'Sign Up', href: '/auth/signup' }, { label: 'Sign In', href: '/auth/signin' }, false]

    return (
        <nav className="navbar navbar-light bg-light">
            <Link href="/">
                <a className="navbar-brand">ZOMBİLET</a>
            </Link>
            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items-center">
                    {links}
                </ul>
            </div>
        </nav>

    )
}

export default Header