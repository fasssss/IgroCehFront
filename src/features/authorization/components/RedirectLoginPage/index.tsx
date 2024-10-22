import { redirect } from 'react-router-dom';
import { useAuthorizeByCodeQuery } from '../../authorizationApi';
import { useEffect } from 'react';

const RedirectLoginPage = () => {
    var url = new URL(window.location.href)
    var authCode = url.searchParams.get("code");
    var errorCode = url.searchParams.get("error_code")
    if(errorCode) {
        redirect("/login");
    }

    if(authCode) {
        var sendAuthCode = useAuthorizeByCodeQuery(authCode);
        useEffect(() => {
            console.log(sendAuthCode);
        }, [sendAuthCode.isSuccess]);
    }

    return(
        <></>
    );
}

export { RedirectLoginPage }