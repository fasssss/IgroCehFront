import { useTranslation } from "react-i18next";
import { WarningAmberRounded } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { useGetSteamProfileStatusQuery } from "../../steamApi";
import { STEAM_PRIVACY_SETTINGS_URL } from "../../steamPaths";
import './styles.scss';

// only for the user with a linked Steam: hidden game details keep Steam from giving their achievements;
// nothing is shown while it is unknown, e.g. Steam doesn't answer
const SteamProfileWarning = ({ className }: SteamProfileWarningProps) => {
    const { t } = useTranslation();
    const status = useGetSteamProfileStatusQuery();

    if(status.data?.isGameDataPublic !== false) {
        return null;
    }

    return(
        <div className={`steam-profile-warning ${className ?? ""}`}>
            <WarningAmberRounded className="steam-profile-warning__icon" />
            <div className="steam-profile-warning__text">
                <div className="steam-profile-warning__title">{t("The game details of your Steam profile are hidden")}</div>
                <div>{t("Steam doesn't give your achievements, so the passing can't be checked automatically. Open the profile and the game details to everyone in the privacy settings of Steam.")}</div>
            </div>
            <div className="steam-profile-warning__actions">
                <a href={STEAM_PRIVACY_SETTINGS_URL} target="_blank" rel="noreferrer" className="steam-profile-warning__settings">
                    {t("Privacy settings of Steam")}
                </a>
                <CommonButton disabled={status.isFetching} onClick={() => status.refetch()}>{t("Check again")}</CommonButton>
            </div>
        </div>
    );
};

type SteamProfileWarningProps = {
    // places the block on the page
    className?: string
}

export { SteamProfileWarning }
