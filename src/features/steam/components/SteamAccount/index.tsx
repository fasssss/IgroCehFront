import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommonModal } from "root/shared/components/CommonModal";
import { AccountButton } from "root/shared/components/AccountButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import iconSteam from "root/assets/design/icon-steam.svg";
import { useUnlinkSteamMutation } from "../../steamApi";
import { steamProfileUrl } from "../../steamPaths";
import { useSteamSignIn } from "../../useSteamSignIn";
import './styles.scss';

// the Steam account of a player in their profile: everyone sees the link to it, the owner links and unlinks it
const SteamAccount = ({ userId, steamId }: SteamAccountProps) => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const isOwn = currentUser?.id === userId;
    // the own account comes with the current user, so it changes right after linking or unlinking
    const linkedSteamId = isOwn ? currentUser.steamId : steamId;
    const [unlinkSteam, unlinking] = useUnlinkSteamMutation();
    const signIn = useSteamSignIn();
    const [isConfirming, setIsConfirming] = useState(false);

    const unlink = async () => {
        setIsConfirming(false);
        await unlinkSteam();
    };

    if(!linkedSteamId) {
        return isOwn ?
            <AccountButton icon={iconSteam} label="Steam" title={t("Link Steam")}
                disabled={signIn.isLeaving}
                onLink={signIn.signIn}
                error={signIn.isFailed ? t("Couldn't open Steam, try again") : undefined}
            />
            : null;
    }

    return(
        <>
            <AccountButton icon={iconSteam} label="Steam" title={t("Profile in Steam")}
                href={steamProfileUrl(linkedSteamId)}
                onUnlink={isOwn ? () => setIsConfirming(true) : undefined}
                unlinkLabel={t("Unlink Steam")}
                disabled={unlinking.isLoading}
                error={unlinking.isError ? t("Couldn't unlink Steam, try again") : undefined}
            />
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
        </>
    );
};

type SteamAccountProps = {
    userId: string,
    // the account of the player as the profile gives it
    steamId: string | null
}

export { SteamAccount }
