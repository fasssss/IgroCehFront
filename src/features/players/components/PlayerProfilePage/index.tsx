import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, Tooltip } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { useGetPlayerProfileQuery } from "../../playersApi";
import { ProfileHero } from "../ProfileHero";
import { PlayerGuilds } from "../PlayerGuilds";
import { PlayerHistory } from "../PlayerHistory";
import { PlayerReviews } from "root/features/reviews/components/PlayerReviews";
import './styles.scss';

// the profile of a player built from every guild shared with the current user;
// the history, the guilds and the reviews under the hero become tabs in the next step of the redesign
const PlayerProfilePage = () => {
    const { userId = "" } = useParams();
    const { t } = useTranslation();
    const profileQuery = useGetPlayerProfileQuery({ userId }, { refetchOnMountOrArgChange: true });
    // data of another player isn't shown while the new one is loading
    const profile = profileQuery.data?.playerProfile.id === userId ? profileQuery.data.playerProfile : undefined;

    if(profileQuery.isError) {
        const isNotFound = 'status' in profileQuery.error && profileQuery.error.status === 404;
        return(
            <div className="player-profile__message">
                <h2>{isNotFound ? t('Player not found or you have no guilds in common') : t("Couldn't load the profile")}</h2>
            </div>
        );
    }

    if(!profile) {
        return(
            <div className="player-profile__message">
                <CircularProgress color="primary" />
            </div>
        );
    }

    return(
        <div className="player-profile">
            <ProfileHero profile={profile} />
            <div className="player-profile__body">
                {
                    (profile.guilds.length > 0 || profile.otherGuildsCount > 0) &&
                    <section className="player-profile__panel">
                        <h2 className="player-profile__panel-title">{t('Guilds')}</h2>
                        {/* another player starts with the collapsed list */}
                        <PlayerGuilds key={userId} guilds={profile.guilds} otherGuildsCount={profile.otherGuildsCount} />
                    </section>
                }
                <div className="player-profile__columns">
                    <section>
                        <h2 className="player-profile__column-title">
                            {t('History')}
                            <Tooltip title={t('History contains only guilds you are a member of too')} arrow placement="right"
                                slotProps={{ tooltip: { sx: { fontSize: 14 } } }}
                            >
                                <HelpOutline className="player-profile__history-hint" tabIndex={0} />
                            </Tooltip>
                        </h2>
                        <PlayerHistory key={userId} userId={userId} />
                    </section>
                    <section>
                        <h2 className="player-profile__column-title">{t('Reviews')}</h2>
                        <PlayerReviews key={userId} userId={userId} />
                    </section>
                </div>
            </div>
        </div>
    );
}

export { PlayerProfilePage }
