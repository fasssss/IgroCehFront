import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { Close } from "@mui/icons-material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { CommonModal } from "root/shared/components/CommonModal";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useUnlinkXboxMutation } from "../../xboxApi";
import { xboxProfileUrl } from "../../xboxPaths";
import { XboxSignInButton } from "../XboxSignInButton";
import './styles.scss';

// the Xbox account of a player in their profile: everyone sees the gamertag with the link to the profile on Xbox,
// the owner links and unlinks it
const XboxAccount = ({ userId, gamertag }: XboxAccountProps) => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const isOwn = currentUser?.id === userId;
    // the own account comes with the current user, so it changes right after linking or unlinking
    const linkedGamertag = isOwn ? currentUser.xboxGamertag : gamertag;
    const [unlinkXbox, unlinking] = useUnlinkXboxMutation();
    const [isConfirming, setIsConfirming] = useState(false);

    const unlink = async () => {
        setIsConfirming(false);
        await unlinkXbox();
    };

    if(!linkedGamertag) {
        return isOwn ? <XboxSignInButton /> : null;
    }

    return(
        <span className="xbox-account">
            <span className="xbox-account__chip">
                <a href={xboxProfileUrl(linkedGamertag)} target="_blank" rel="noreferrer" className="xbox-account__profile" title={t("Profile on Xbox")}>
                    <SvgIcon className="xbox-account__logo"><SvgSelector iconName="xbox-icon" /></SvgIcon>
                    <span className="xbox-account__gamertag">{linkedGamertag}</span>
                </a>
                {
                    isOwn &&
                    <button
                    className="xbox-account__unlink"
                    title={t("Unlink Xbox")}
                    aria-label={t("Unlink Xbox")}
                    disabled={unlinking.isLoading}
                    onClick={() => setIsConfirming(true)}>
                        <Close fontSize="small" />
                    </button>
                }
            </span>
            {unlinking.isError && <span className="xbox-account__error">{t("Couldn't unlink Xbox, try again")}</span>}
            {
                isConfirming &&
                <CommonModal
                name={t("Unlink Xbox?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={unlink}
                onClose={() => setIsConfirming(false)}>
                    <div className="xbox-account__modal-text">
                        {t("The Xbox account disappears from your profile, you can link it again at any time.")}
                    </div>
                </CommonModal>
            }
        </span>
    );
};

type XboxAccountProps = {
    userId: string,
    // the gamertag of the player as the profile gives it
    gamertag: string | null
}

export { XboxAccount }
