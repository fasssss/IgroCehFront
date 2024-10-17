import { redirect } from 'react-router-dom';
import { usePostAuthorizationCodeMutation } from '../../authorizationApi';
import { useRef } from 'react';
import { usePatchedEffect } from 'root/shared/hooks/usePatchedEffect';

const RedirectLoginPage = () => {
    var [postAuthCode] = usePostAuthorizationCodeMutation();
    const isThisComponentInitialized = useRef(false)
    var url = new URL(window.location.href)
    var authCode = url.searchParams.get("code");
    var errorCode = url.searchParams.get("error_code")
    if(errorCode) {
        redirect("/login");
    }

    usePatchedEffect(() => {
        if(!isThisComponentInitialized.current){
            isThisComponentInitialized.current = true;
            if(authCode){
                postAuthCode(authCode);
            }
        }
    }, []);

    return(
        <></>
    );
}

export { RedirectLoginPage }