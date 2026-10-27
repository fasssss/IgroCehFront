import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { Close } from "@mui/icons-material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { CommonModal } from "root/shared/components/CommonModal";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useUnlinkSteamMutation } from "../../steamApi";
import { steamProfileUrl } from "../../steamPaths";
import { SteamSignInButton } from "../SteamSignInButton";
import './styles.scss';

// the Steam account of a player in their profile: everyone sees the link to it, the owner links and unlinks it
const SteamAccount = ({ userId, steamId }: SteamAccountProps) => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const isOwn = currentUser?.id === userId;
    // the own account comes with the current user, so it changes right after linking or unlinking
    const linkedSteamId = isOwn ? currentUser.steamId : steamId;
    const [unlinkSteam, unlinking] = useUnlinkSteamMutation();
    const [isConfirming, setIsConfirming] = useState(false);

    const unlink = async () => {
        setIsConfirming(false);
        await unlinkSteam();
    };

    if(!linkedSteamId) {
        return isOwn ? <SteamSignInButton /> : null;
    }

    return(
        <span className="steam-account">
            <span className="steam-account__chip">
                <a href={steamProfileUrl(linkedSteamId)} target="_blank" rel="noreferrer" className="steam-account__profile" title={t("Profile in Steam")}>
                    <SvgIcon className="steam-account__logo"><SvgSelector iconName="steam-icon" /></SvgIcon>
                    Steam
                </a>
                {
                    isOwn &&
                    <button
                    className="steam-account__unlink"
                    title={t("Unlink Steam")}
                    aria-label={t("Unlink Steam")}
                    disabled={unlinking.isLoading}
                    onClick={() => setIsConfirming(true)}>
                        <Close fontSize="small" />
                    </button>
                }
            </span>
            {unlinking.isError && <span className="steam-account__error">{t("Couldn't unlink Steam, try again")}</span>}
            {
                isConfirming &&
                <CommonModal
                name={t("Unlink Steam?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={unlink}
                onClose={() => setIsConfirming(false)}>
                    <div className="steam-account__modal-text">
                        {t("Global events won't check your passing through Steam until you link it again.")}
                    </div>
                </CommonModal>
            }
        </span>
    );
};

type SteamAccountProps = {
    userId: string,
    // the account of the player as the profile gives it
    steamId: string | null
}

export { SteamAccount }
