import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AutoAwesome, Edit } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { SteamSignInButton } from "root/features/steam/components/SteamSignInButton";
import { XboxSignInButton } from "root/features/xbox/components/XboxSignInButton";
import { GlobalEvent } from "../../globalEventsApi";
import { globalEventEditPath, globalEventPath } from "../../globalEventPath";
import { AchievementPlatform, hasAchievementsOn } from "../../achievementPlatforms";
import './styles.scss';

// the active global event on the main page: everyone can start it, Steam and Xbox aren't required, so each is only offered
// to those who haven't linked it when the event has achievements there; the administrator of the site changes the event from here
const GlobalEventBanner = ({ globalEvent }: GlobalEventBannerProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useCurrentUser();

    return(
        <section className="global-event-banner">
            {
                globalEvent.imageUrl &&
                <img src={resolveImageUrl(globalEvent.imageUrl)} className="global-event-banner__image" alt="" />
            }
            <div className="global-event-banner__body">
                <div className="global-event-banner__label">
                    <AutoAwesome fontSize="small" />
                    {t("Global event")}
                </div>
                <h2 className="global-event-banner__name">{globalEvent.name}</h2>
                {
                    globalEvent.description &&
                    <p className="global-event-banner__description">{globalEvent.description}</p>
                }
                <div className="global-event-banner__actions">
                    <CommonButton color="success" onClick={() => navigate(globalEventPath(globalEvent.id))}>
                        {t("Start the event")}
                    </CommonButton>
                    {user && !user.steamId && hasAchievementsOn(globalEvent, AchievementPlatform.Steam) && <SteamSignInButton />}
                    {user && !user.xboxGamertag && hasAchievementsOn(globalEvent, AchievementPlatform.Xbox) && <XboxSignInButton />}
                    {
                        user?.isAppAdmin &&
                        <span className="global-event-banner__admin">
                            <CommonButton startIcon={<Edit />} onClick={() => navigate(globalEventEditPath(globalEvent.id))}>
                                {t("Edit the global event")}
                            </CommonButton>
                        </span>
                    }
                </div>
            </div>
        </section>
    );
};

type GlobalEventBannerProps = {
    globalEvent: GlobalEvent
}

export { GlobalEventBanner }
