import { CircularProgress, SvgIcon } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CommonButton } from 'root/shared/components/CommonButton';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { PoweredBy } from 'root/shared/components/PoweredBy';
import { useGetDiscordApiLinkQuery, useGetUserObjectQuery } from '../../authorizationApi';
import { useTranslation } from 'react-i18next';
import './styles.scss';

const LoginPage = () => {

    // Start of code section for page animateed background
    const [leftPosition, setLeftPosition] = useState(0);

    useEffect(() => {
        const mouseListener = (event: MouseEvent) => {
            const x = (window.innerWidth - event.pageX * 10) / 90;
            setLeftPosition(x);
        }

        document.addEventListener("mousemove", mouseListener);
        return(() => {
            document.removeEventListener("mousemove", mouseListener);
        });
    }, []);
    // End of code section for page animated background

    const { t } = useTranslation()
    const getDiscordApiLink = useGetDiscordApiLinkQuery();
    const getUserObject = useGetUserObjectQuery();

    const authByDiscord = () => {
        window.location.href = getDiscordApiLink.data?.discordApiLink
        || window.location.href
    }

    if(getUserObject.isSuccess) {
        return <Navigate to="/" replace />;
    }

    return(
        <div className="login-page">
            <div style={{left: leftPosition}} className="lines">
                <div className="line"><span className="line__drop" /></div>
                <div className="line"><span className="line__drop" /></div>
                <div className="line"><span className="line__drop" /></div>
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
            <PoweredBy className="login-page__powered-by" />
        </div>
    );
};

export { LoginPage };
