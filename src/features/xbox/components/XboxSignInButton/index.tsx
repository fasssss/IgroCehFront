import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { useXboxSignIn } from "../../useXboxSignIn";
import './styles.scss';

// the button of the sign-in to Xbox in the green of Xbox
const XboxSignInButton = ({ returnPath, children }: PropsWithChildren<XboxSignInButtonProps>) => {
    const { t } = useTranslation();
    const { signIn, isLeaving, isFailed } = useXboxSignIn(returnPath);

    return(
        <span className="xbox-sign-in">
            <button className="xbox-sign-in__button" disabled={isLeaving} onClick={signIn}>
                <SvgIcon className="xbox-sign-in__logo"><SvgSelector iconName="xbox-icon" /></SvgIcon>
                {children ?? t("Link Xbox")}
            </button>
            {isFailed && <span className="xbox-sign-in__error">{t("Couldn't open Xbox, try again")}</span>}
        </span>
    );
};

type XboxSignInButtonProps = {
    returnPath?: string
}

export { XboxSignInButton }
