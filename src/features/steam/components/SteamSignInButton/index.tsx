import { PropsWithChildren, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { useLazyGetSteamSignInLinkQuery } from "../../steamApi";
import './styles.scss';

// the button of the sign-in to Steam, drawn like the one of Steam itself: the browser leaves the site for Steam,
// Steam sends it back to returnPath, the current page by default
const SteamSignInButton = ({ returnPath, children }: PropsWithChildren<SteamSignInButtonProps>) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [getSteamSignInLink] = useLazyGetSteamSignInLinkQuery();
    const [isLeaving, setIsLeaving] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const signIn = async () => {
        setIsLeaving(true);
        setIsFailed(false);
        try {
            const { steamSignInLink } = await getSteamSignInLink(returnPath ?? location.pathname + location.search).unwrap();
            window.location.assign(steamSignInLink);
        } catch {
            setIsLeaving(false);
            setIsFailed(true);
        }
    };

    return(
        <span className="steam-sign-in">
            <button className="steam-sign-in__button" disabled={isLeaving} onClick={signIn}>
                <SvgIcon className="steam-sign-in__logo"><SvgSelector iconName="steam-icon" /></SvgIcon>
                {children ?? t("Link Steam")}
            </button>
            {isFailed && <span className="steam-sign-in__error">{t("Couldn't open Steam, try again")}</span>}
        </span>
    );
};

type SteamSignInButtonProps = {
    returnPath?: string
}

export { SteamSignInButton }
