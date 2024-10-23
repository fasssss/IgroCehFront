import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuthorizeByCodeQuery } from '../../authorizationApi';
import { authorizationSuccess } from '../../authorizationSlice';

const RedirectLoginPage = () => {
    var navigate = useNavigate();
    var url = new URL(window.location.href)
    var authCode = url.searchParams.get("code");
    var errorCode = url.searchParams.get("error_code")
    if(errorCode) {
        navigate("/login");
    }

    if(authCode) {
        var sendAuthCode = useAuthorizeByCodeQuery(authCode);
        var dispatch = useDispatch();
        useEffect(() => {
            if(sendAuthCode.isSuccess) {
                dispatch(authorizationSuccess({
                    userName: sendAuthCode.data.userName,
                    email: sendAuthCode.data.email,
                    avatarUrl: sendAuthCode.data.avatarUrl
                }));
                navigate("/browsing");
            }
        }, [sendAuthCode.isSuccess]);
    }

    return(
        <></>
    );
}

export { RedirectLoginPage }