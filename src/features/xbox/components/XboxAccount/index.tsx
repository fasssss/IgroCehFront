import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommonModal } from "root/shared/components/CommonModal";
import { AccountButton } from "root/shared/components/AccountButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import iconXbox from "root/assets/design/icon-xbox.svg";
import { useUnlinkXboxMutation } from "../../xboxApi";
import { xboxProfileUrl } from "../../xboxPaths";
import { useXboxSignIn } from "../../useXboxSignIn";
import './styles.scss';

// the Xbox account of a player in their profile: everyone sees the link to the profile on Xbox (the gamertag is in its hint),
// the owner links and unlinks it
const XboxAccount = ({ userId, gamertag }: XboxAccountProps) => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const isOwn = currentUser?.id === userId;
    // the own account comes with the current user, so it changes right after linking or unlinking
    const linkedGamertag = isOwn ? currentUser.xboxGamertag : gamertag;
    const [unlinkXbox, unlinking] = useUnlinkXboxMutation();
    const signIn = useXboxSignIn();
    const [isConfirming, setIsConfirming] = useState(false);

    const unlink = async () => {
        setIsConfirming(false);
        await unlinkXbox();
    };

    if(!linkedGamertag) {
        return isOwn ?
            <AccountButton icon={iconXbox} label="Xbox" title={t("Link Xbox")}
                disabled={signIn.isLeaving}
                onLink={signIn.signIn}
                error={signIn.isFailed ? t("Couldn't open Xbox, try again") : undefined}
            />
            : null;
    }

    return(
        <>
            <AccountButton icon={iconXbox} label="Xbox" title={`${t("Profile on Xbox")}: ${linkedGamertag}`}
                href={xboxProfileUrl(linkedGamertag)}
                onUnlink={isOwn ? () => setIsConfirming(true) : undefined}
                unlinkLabel={t("Unlink Xbox")}
                disabled={unlinking.isLoading}
                error={unlinking.isError ? t("Couldn't unlink Xbox, try again") : undefined}
            />
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
        </>
    );
};

type XboxAccountProps = {
    userId: string,
    // the gamertag of the player as the profile gives it
    gamertag: string | null
}

export { XboxAccount }
