import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { Close } from "@mui/icons-material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { CommonModal } from "root/shared/components/CommonModal";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useUnlinkPsnMutation } from "../../psnApi";
import { psnProfileUrl } from "../../psnPaths";
import { PsnLinkButton } from "../PsnLinkButton";
import './styles.scss';

// the PSN account of a player in their profile: everyone sees the online id with the link to the profile on PSN,
// the owner links and unlinks it
const PsnAccount = ({ userId, onlineId }: PsnAccountProps) => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const isOwn = currentUser?.id === userId;
    // the own account comes with the current user, so it changes right after linking or unlinking
    const linkedOnlineId = isOwn ? currentUser.psnOnlineId : onlineId;
    const [unlinkPsn, unlinking] = useUnlinkPsnMutation();
    const [isConfirming, setIsConfirming] = useState(false);

    const unlink = async () => {
        setIsConfirming(false);
        await unlinkPsn();
    };

    if(!linkedOnlineId) {
        return isOwn ? <PsnLinkButton /> : null;
    }

    return(
        <span className="psn-account">
            <span className="psn-account__chip">
                <a href={psnProfileUrl(linkedOnlineId)} target="_blank" rel="noreferrer" className="psn-account__profile" title={t("Profile on PSN")}>
                    <SvgIcon className="psn-account__logo"><SvgSelector iconName="psn-icon" /></SvgIcon>
                    <span className="psn-account__online-id">{linkedOnlineId}</span>
                </a>
                {
                    isOwn &&
                    <button
                    className="psn-account__unlink"
                    title={t("Unlink PSN")}
                    aria-label={t("Unlink PSN")}
                    disabled={unlinking.isLoading}
                    onClick={() => setIsConfirming(true)}>
                        <Close fontSize="small" />
                    </button>
                }
            </span>
            {unlinking.isError && <span className="psn-account__error">{t("Couldn't unlink PSN, try again")}</span>}
            {
                isConfirming &&
                <CommonModal
                name={t("Unlink PSN?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={unlink}
                onClose={() => setIsConfirming(false)}>
                    <div className="psn-account__modal-text">
                        {t("The PSN account disappears from your profile, you can link it again at any time.")}
                    </div>
                </CommonModal>
            }
        </span>
    );
};

type PsnAccountProps = {
    userId: string,
    // the online id of the player as the profile gives it
    onlineId: string | null
}

export { PsnAccount }
