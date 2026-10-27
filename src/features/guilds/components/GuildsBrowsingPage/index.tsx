import { useTranslation } from "react-i18next";
import { SearchBar } from "root/shared/components/SearchBar";
import { useGetPlayedGuildsQuery, useLazyGetSearchedGuildsQuery } from "../../guildsApi";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AutoAwesome, Edit } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useGetActiveGlobalEventQuery } from "root/features/globalEvents/globalEventsApi";
import { globalEventEditPath, NEW_GLOBAL_EVENT_PATH } from "root/features/globalEvents/globalEventPath";
import './styles.scss';

const GuildsBrowsingPage = () => {
    const [searchBar, searchResult] = useLazyGetSearchedGuildsQuery();
    // guilds of the user's events are shown under the search for quick access
    const playedGuilds = useGetPlayedGuildsQuery(undefined, { refetchOnMountOrArgChange: true });
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useCurrentUser();
    // only the administrator of the site sees the button: one global event is active at a time,
    // so it constructs a new event or changes the active one
    const activeGlobalEvent = useGetActiveGlobalEventQuery(user?.isAppAdmin ? undefined : skipToken);
    const active = activeGlobalEvent.data?.globalEvent;

    return(
        <div className="guild-browser">
            {
                user?.isAppAdmin && activeGlobalEvent.data &&
                <div className="guild-browser__global-event">
                    {
                        active ?
                        <CommonButton startIcon={<Edit />} onClick={() => navigate(globalEventEditPath(active.id))}>
                            {t("Edit the global event")}
                        </CommonButton>
                        :
                        <CommonButton startIcon={<AutoAwesome />} onClick={() => navigate(NEW_GLOBAL_EVENT_PATH)}>
                            {t("Construct a global event")}
                        </CommonButton>
                    }
                </div>
            }
            <SearchBar
            placeholder={t('Search guild...')}
            isFetchingResult={searchResult.isFetching}
            onTyping={searchBar}
            optionsSelect={
                searchResult.data?.guildObjects?.map(items => {
                    return({
                        id: items.id,
                        label: items.name,
                        iconUrl: items.iconUrl
                    })
                })
            }
            handleOptionClick={guildId => navigate(`guild/${guildId}`)} />
            {
                !!playedGuilds.data?.guilds.length &&
                <section className="guild-browser__played">
                    <h2 className="guild-browser__played-title">{t('Guilds you played in')}</h2>
                    <div className="guild-browser__played-list">
                        {
                            playedGuilds.data.guilds.map(guild =>
                                <button key={guild.id} className="guild-browser__guild" onClick={() => navigate(`guild/${guild.id}`)}>
                                    {
                                        guild.iconUrl ?
                                        <img src={guild.iconUrl} className="guild-browser__guild-icon" />
                                        :
                                        <span className="guild-browser__guild-icon guild-browser__guild-icon--empty">{guild.name.charAt(0)}</span>
                                    }
                                    <span className="guild-browser__guild-info">
                                        <span className="guild-browser__guild-name">{guild.name}</span>
                                        <span className="guild-browser__guild-events">
                                            {t('{{count}} events', { count: guild.eventsPlayed })}
                                            {guild.eventsInProgress > 0 && ` · ${t('{{count}} in progress', { count: guild.eventsInProgress })}`}
                                        </span>
                                    </span>
                                </button>
                            )
                        }
                    </div>
                </section>
            }
        </div>
    );
}

export { GuildsBrowsingPage }
