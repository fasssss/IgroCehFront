import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircularProgress, SvgIcon } from "@mui/material";
import { AutoAwesome, Edit, FactCheck } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { SteamProfileWarning } from "root/features/steam/components/SteamProfileWarning";
import { useGetGlobalEventClaimsQuery, useGetGlobalEventParticipationQuery, useGetGlobalEventQuery } from "../../globalEventsApi";
import { globalEventClaimsPath, globalEventEditPath } from "../../globalEventPath";
import { ClaimStatus } from "../../globalEventClaims";
import { ACHIEVEMENT_PLATFORM_NAME, AchievementPlatform, hasAchievementsOn, platformsToLink } from "../../achievementPlatforms";
import { badgeImageUrl } from "../../badges";
import { GlobalEventGameCard } from "../GlobalEventGameCard";
import { GlobalEventParticipation } from "../GlobalEventParticipation";
import { PlatformSignInButton } from "../PlatformSignInButton";
import './styles.scss';

// a global event with the whole description and every game with the achievements that count as its passing,
// a finished one too
const GlobalEventPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { globalEventId } = useParams();
    const user = useCurrentUser();
    const globalEventQuery = useGetGlobalEventQuery(globalEventId ?? skipToken, { refetchOnMountOrArgChange: true });
    const globalEvent = globalEventQuery.data?.globalEvent;
    // the administrators see how many claims wait for them
    const claimsQuery = useGetGlobalEventClaimsQuery(user?.isAppAdmin && globalEventId ? globalEventId : skipToken, { refetchOnMountOrArgChange: true });
    const pendingClaimCount = claimsQuery.data?.claims.filter(claim => claim.status === ClaimStatus.Pending).length;
    // the same query as the participation below reads, it isn't sent twice
    const participationQuery = useGetGlobalEventParticipationQuery(globalEventId ?? skipToken);

    if(globalEventQuery.isError) {
        const isNotFound = 'status' in globalEventQuery.error && globalEventQuery.error.status === 404;
        return(
            <div className="global-event-page__message">
                <h2>{isNotFound ? t("The event isn't found") : t("Couldn't load the event")}</h2>
                <CommonButton onClick={() => navigate('/')}>{t("To the main page")}</CommonButton>
            </div>
        );
    }

    if(!globalEvent) {
        return(
            <div className="global-event-page__message">
                <CircularProgress color="primary" />
            </div>
        );
    }

    // the platforms the player can link to have the passing checked by itself
    const offeredPlatforms = user ? platformsToLink(globalEvent, user) : [];
    const offeredNames = offeredPlatforms.map(platform => ACHIEVEMENT_PLATFORM_NAME[platform]);

    return(
        <div className="global-event-page">
            <header className="global-event-page__header">
                {
                    globalEvent.imageUrl &&
                    <img src={resolveImageUrl(globalEvent.imageUrl)} className="global-event-page__image" alt="" />
                }
                <div className="global-event-page__header-body">
                    <div className="global-event-page__label">
                        <AutoAwesome fontSize="small" />
                        {t("Global event")}
                    </div>
                    <h1 className="global-event-page__name">{globalEvent.name}</h1>
                    <span className="global-event-page__participants">
                        {t("Players taking part: {{count}}", { count: globalEvent.participantCount })}
                        {` · ${t("Passed: {{count}}", { count: globalEvent.passedCount })}`}
                    </span>
                    {
                        globalEvent.finishedAt &&
                        <span className="global-event-page__finished">
                            {t("The event finished on {{date}}", {
                                date: new Date(globalEvent.finishedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
                            })}
                        </span>
                    }
                    {
                        globalEvent.description &&
                        <p className="global-event-page__description">{globalEvent.description}</p>
                    }
                    {
                        globalEvent.badgeId &&
                        <div className="global-event-page__reward">
                            <img src={badgeImageUrl(globalEvent.badgeId)} className="global-event-page__reward-image" alt="" />
                            {t("The reward for the passing")}
                        </div>
                    }
                    {
                        user?.isAppAdmin &&
                        <div className="global-event-page__admin">
                            <CommonButton startIcon={<Edit />} onClick={() => navigate(globalEventEditPath(globalEvent.id))}>
                                {t("Edit the global event")}
                            </CommonButton>
                            <CommonButton startIcon={<FactCheck />} onClick={() => navigate(globalEventClaimsPath(globalEvent.id))}>
                                {t("Claims of the passing")}
                                {!!pendingClaimCount && ` (${pendingClaimCount})`}
                            </CommonButton>
                        </div>
                    }
                </div>
            </header>
            {
                // the platforms aren't required, they only check the passing by themselves, so they aren't needed after the passing;
                // each is offered only when the event has achievements there, the hidden game details of Steam matter only then
                !globalEvent.finishedAt && user && !participationQuery.data?.participation?.passedAt &&
                <>
                    {user.steamId && hasAchievementsOn(globalEvent, AchievementPlatform.Steam) && <SteamProfileWarning className="global-event-page__steam-warning" />}
                    {
                        offeredPlatforms.length > 0 &&
                        <div className="global-event-page__steam">
                            <span>
                                {
                                    offeredNames.length === 1 ?
                                    t("Link {{platform}}, and the passing of the games with achievements in {{platform}} will be checked automatically", { platform: offeredNames[0] })
                                    :
                                    t("Link {{platforms}}, and the passing of the games with achievements will be checked automatically", { platforms: offeredNames.join(` ${t("or")} `) })
                                }
                            </span>
                            <span className="global-event-page__sign-ins">
                                {offeredPlatforms.map(platform => <PlatformSignInButton key={platform} platform={platform} />)}
                            </span>
                        </div>
                    }
                </>
            }
            <GlobalEventParticipation globalEvent={globalEvent} />
            <section className="global-event-page__games">
                <h2 className="global-event-page__games-title">{t("Games of the event: {{count}}", { count: globalEvent.games.length })}</h2>
                <p className="global-event-page__hint">{t("Any one of the achievements of a game counts as its passing")}</p>
                <div className="global-event-page__game-list">
                    {
                        globalEvent.games.map(game =>
                            <GlobalEventGameCard
                            key={game.appId}
                            name={game.game.name}
                            imageUrl={game.game.imageUrl}
                            achievements={game.achievements}
                            actions={
                                game.game.steamUrl &&
                                <a href={game.game.steamUrl} target="_blank" rel="noreferrer" className="global-event-page__store">
                                    <SvgIcon className="global-event-page__store-logo"><SvgSelector iconName="steam-icon" /></SvgIcon>
                                    {t("In Steam")}
                                </a>
                            } />
                        )
                    }
                </div>
            </section>
        </div>
    );
};

export { GlobalEventPage }
