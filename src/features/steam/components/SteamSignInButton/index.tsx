import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { useSteamSignIn } from "../../useSteamSignIn";
import './styles.scss';

// the button of the sign-in to Steam, drawn like the one of Steam itself
const SteamSignInButton = ({ returnPath, children }: PropsWithChildren<SteamSignInButtonProps>) => {
    const { t } = useTranslation();
    const { signIn, isLeaving, isFailed } = useSteamSignIn(returnPath);

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
