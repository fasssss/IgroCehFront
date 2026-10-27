import { useTranslation } from "react-i18next";
import { SearchBar } from "root/shared/components/SearchBar";
import { useGetPlayedGuildsQuery, useLazyGetSearchedGuildsQuery } from "../../guildsApi";
import { useNavigate } from "react-router-dom";
import { AutoAwesome } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useGetActiveGlobalEventQuery } from "root/features/globalEvents/globalEventsApi";
import { NEW_GLOBAL_EVENT_PATH } from "root/features/globalEvents/globalEventPath";
import { GlobalEventBanner } from "root/features/globalEvents/components/GlobalEventBanner";
import './styles.scss';

const GuildsBrowsingPage = () => {
    const [searchBar, searchResult] = useLazyGetSearchedGuildsQuery();
    // guilds of the user's events are shown under the search for quick access
    const playedGuilds = useGetPlayedGuildsQuery(undefined, { refetchOnMountOrArgChange: true });
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useCurrentUser();
    // everyone sees the banner of the active global event; one is active at a time,
    // so without it the administrator of the site gets the button to construct a new one
    const activeGlobalEvent = useGetActiveGlobalEventQuery();
    const active = activeGlobalEvent.data?.globalEvent;

    return(
        <div className="guild-browser">
            {active && <GlobalEventBanner globalEvent={active} />}
            {
                user?.isAppAdmin && activeGlobalEvent.data && !active &&
                <div className="guild-browser__global-event">
                    <CommonButton startIcon={<AutoAwesome />} onClick={() => navigate(NEW_GLOBAL_EVENT_PATH)}>
                        {t("Construct a global event")}
                    </CommonButton>
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
