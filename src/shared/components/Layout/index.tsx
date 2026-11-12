import { Navigate, Outlet, useMatches } from 'react-router-dom';
import { useGetUserObjectQuery } from 'root/features/authorization/authorizationApi';
import { isUnauthorizedError } from 'root/shared/igroCehApi';
import { Header } from 'root/shared/components/Header';
import { Footer } from 'root/shared/components/Footer';
import './styles.scss';

// a route with handle { flush: true } starts right under the header, the old pages keep their top padding
export type LayoutHandle = {
    flush?: boolean
}

function Layout() {
    const getUserObject = useGetUserObjectQuery();
    const matches = useMatches();
    const isFlush = matches.some(match => (match.handle as LayoutHandle | undefined)?.flush);

    if(isUnauthorizedError(getUserObject.error)) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="layout">
            <Header />
            <main className={`layout__content ${isFlush ? 'layout__content--flush' : ''}`}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
