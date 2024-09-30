import { CommonButton } from 'root/shared/components/CommonButton';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import './styles.scss'
import { SvgIcon } from '@mui/material';

const LoginPage = () => {
    return(
        <div className="login-page">
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