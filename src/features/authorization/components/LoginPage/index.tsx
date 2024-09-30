import { CommonButton } from 'root/shared/components/CommonButton';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import './styles.scss'
import { SvgIcon } from '@mui/material';
import { useEffect, useState } from 'react';

const LoginPage = () => {
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

    return(
        <div className="login-page">
            <div style={{left: leftPosition}} className="lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
            <div className="login-page__container">
                <h1>Show thyself</h1>
                <CommonButton endIcon={<SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>}>
                    Loggin with
                </CommonButton>
            </div>
        </div>
    );
};

export { LoginPage };