import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircularProgress, SvgIcon } from "@mui/material";
import { AutoAwesome, Edit } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { SteamSignInButton } from "root/features/steam/components/SteamSignInButton";
import { SteamProfileWarning } from "root/features/steam/components/SteamProfileWarning";
import { useGetGlobalEventQuery } from "../../globalEventsApi";
import { globalEventEditPath } from "../../globalEventPath";
import { GlobalEventGameCard } from "../GlobalEventGameCard";
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
                        user?.isAppAdmin &&
                        <div className="global-event-page__admin">
                            <CommonButton startIcon={<Edit />} onClick={() => navigate(globalEventEditPath(globalEvent.id))}>
                                {t("Edit the global event")}
                            </CommonButton>
                        </div>
                    }
                </div>
            </header>
            {
                // Steam isn't required, it only checks the passing by itself
                !globalEvent.finishedAt && user &&
                (
                    user.steamId ?
                    <SteamProfileWarning className="global-event-page__steam-warning" />
                    :
                    <div className="global-event-page__steam">
                        <span>{t("Link Steam, and the passing of the games with achievements will be checked automatically")}</span>
                        <SteamSignInButton />
                    </div>
                )
            }
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
