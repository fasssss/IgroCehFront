import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CommonModal } from "root/shared/components/CommonModal";
import { AccountButton } from "root/shared/components/AccountButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import iconPlaystation from "root/assets/design/icon-playstation.svg";
import { useUnlinkPsnMutation } from "../../psnApi";
import { psnLinkPath, psnProfileUrl } from "../../psnPaths";
import './styles.scss';

// the PSN account of a player in their profile: everyone sees the link to the profile on PSN (the online id is in its hint),
// the owner links it on the page of the link and unlinks it here
const PsnAccount = ({ userId, onlineId }: PsnAccountProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
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
        return isOwn ?
            <AccountButton icon={iconPlaystation} label="Playstation" title={t("Link PSN")}
                onLink={() => navigate(psnLinkPath(location.pathname + location.search))}
            />
            : null;
    }

    return(
        <>
            <AccountButton icon={iconPlaystation} label="Playstation" title={`${t("Profile on PSN")}: ${linkedOnlineId}`}
                href={psnProfileUrl(linkedOnlineId)}
                onUnlink={isOwn ? () => setIsConfirming(true) : undefined}
                unlinkLabel={t("Unlink PSN")}
                disabled={unlinking.isLoading}
                error={unlinking.isError ? t("Couldn't unlink PSN, try again") : undefined}
            />
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
        </>
    );
};

type PsnAccountProps = {
    userId: string,
    // the online id of the player as the profile gives it
    onlineId: string | null
}

export { PsnAccount }
