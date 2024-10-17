import { CircularProgress, SvgIcon } from '@mui/material';
import { useEffect, useState } from 'react';
import { CommonButton } from 'root/shared/components/CommonButton';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { useGetDiscordApiLinkQuery } from '../../authorizationApi';
import './styles.scss'

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

    const getDiscordApiLink = useGetDiscordApiLinkQuery();

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
                <h1>Show thyself</h1>
                {
                    !getDiscordApiLink.isLoading ?
                    <CommonButton onClick={authByDiscord} endIcon={<SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>}>
                        Login with
                    </CommonButton>
                    : 
                    <CircularProgress color="primary" />
                }
            </div>
        </div>
    );
};

export { LoginPage };