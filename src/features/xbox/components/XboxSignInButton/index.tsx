import { PropsWithChildren, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { useLazyGetXboxSignInLinkQuery } from "../../xboxApi";
import { rememberXboxLink } from "../../xboxPaths";
import './styles.scss';

// the button of the sign-in to Xbox in the green of Xbox: the browser leaves the site for OpenXBL and Microsoft,
// the tab remembers returnPath (the current page by default) to come back to it
const XboxSignInButton = ({ returnPath, children }: PropsWithChildren<XboxSignInButtonProps>) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [getXboxSignInLink] = useLazyGetXboxSignInLinkQuery();
    const [isLeaving, setIsLeaving] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const signIn = async () => {
        setIsLeaving(true);
        setIsFailed(false);
        try {
            const { xboxSignInLink } = await getXboxSignInLink().unwrap();
            rememberXboxLink(returnPath ?? location.pathname + location.search);
            window.location.assign(xboxSignInLink);
        } catch {
            setIsLeaving(false);
            setIsFailed(true);
        }
    };

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
