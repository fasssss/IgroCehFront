import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthorizeByCodeMutation } from '../../authorizationApi';

// Discord redirects here with either "code" or "error" in query string
const RedirectLoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [authorizeByCode] = useAuthorizeByCodeMutation();
    const authCode = searchParams.get("code");

    useEffect(() => {
        if(!authCode) {
            navigate("/login", { replace: true });
            return;
        }

        authorizeByCode(authCode).unwrap()
            .then(() => navigate("/", { replace: true }))
            .catch(() => navigate("/login", { replace: true }));
    }, [authCode, authorizeByCode, navigate]);

    return null;
}

export { RedirectLoginPage }
