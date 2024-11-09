import { CircularProgress, SvgIcon } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { CommonButton } from 'root/shared/components/CommonButton';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { router } from 'root/shared/router';
import { useGetDiscordApiLinkQuery, useGetUserObjectQuery } from '../../authorizationApi';
import { setUserObject } from '../../authorizationSlice';
import { useTranslation } from 'react-i18next';
import './styles.scss';

const LoginPage = () => {

    // Start of code section for page animateed background
    const [leftPosition, setLeftPosition] = useState(0);
    const mouseListener = (event: MouseEvent) => {
        let x = (window.innerWidth - event.pageX * 10) / 90;
        setLeftPosition(x);
    }

    useEffect(() => {
        document.addEventListener("mousemove", mouseListener);
        return(() => {
            document.removeEventListener("mousemove", mouseListener);
        });
    }, []);
    // End of code section for page animated background

    const { t } = useTranslation()
    const getDiscordApiLink = useGetDiscordApiLinkQuery();
    const dispatch = useDispatch();
    const getUserObject = useGetUserObjectQuery();
    useEffect(() => {
        if(getUserObject.isSuccess) {
            dispatch(setUserObject({
                userName: getUserObject.data.userName,
                email: getUserObject.data.email,
                avatarUrl: getUserObject.data.avatarUrl,
                id: getUserObject.data.id
            }));
            router.navigate("/");
        }
    }, [getUserObject.isSuccess])

    const authByDiscord = () => {
        window.location.href = getDiscordApiLink.data?.discordApiLink
        || window.location.href
    }

    return(
        <div className="login-page">
            <div style={{left: leftPosition}} className="lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
            <div className="login-page__container">
                <h1>{t('Show Thyself')}</h1>
                {
                    !getDiscordApiLink.isLoading && !getUserObject.isLoading ?
                    <CommonButton onClick={authByDiscord} endIcon={<SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>}>
                        {t('Login')}
                    </CommonButton>
                    : 
                    <CircularProgress color="primary" />
                }
            </div>
        </div>
    );
};

export { LoginPage };