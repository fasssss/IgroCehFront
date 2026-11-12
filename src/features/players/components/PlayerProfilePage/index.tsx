import { ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { DsTabs } from "root/shared/components/DsTabs";
import iconHistory from "root/assets/design/tab-history.svg";
import iconHistoryActive from "root/assets/design/tab-history-active.svg";
import iconLadder from "root/assets/design/tab-ladder.svg";
import iconLadderActive from "root/assets/design/tab-ladder-active.svg";
import iconGuilds from "root/assets/design/tab-guilds.svg";
import iconGames from "root/assets/design/tab-games.svg";
import iconGamesActive from "root/assets/design/tab-games-active.svg";
import { useGetPlayerProfileQuery } from "../../playersApi";
import { ProfileTab, toProfileTab } from "../../profileTabs";
import { ProfileHero } from "../ProfileHero";
import { PlayerGuilds } from "../PlayerGuilds";
import { PlayerHistory } from "../PlayerHistory";
import { ProfileSoon } from "../ProfileSoon";
import './styles.scss';

// the layouts have no active icon of the guilds, the tab keeps its usual one
const TAB_ICONS: Record<ProfileTab, { icon: string, active: string }> = {
    history: { icon: iconHistory, active: iconHistoryActive },
    ladder: { icon: iconLadder, active: iconLadderActive },
    guilds: { icon: iconGuilds, active: iconGuilds },
    games: { icon: iconGames, active: iconGamesActive },
};

const TAB_LABELS: Record<ProfileTab, string> = {
    history: 'profile.tabs.history',
    ladder: 'profile.tabs.ladder',
    guilds: 'profile.tabs.guilds',
    games: 'profile.tabs.games',
};

// the profile of a player built from every guild shared with the current user: the hero and the tabs under it
const PlayerProfilePage = () => {
    const { userId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = toProfileTab(searchParams.get('tab'));
    const { t } = useTranslation();
    const profileQuery = useGetPlayerProfileQuery({ userId }, { refetchOnMountOrArgChange: true });
    // data of another player isn't shown while the new one is loading
    const profile = profileQuery.data?.playerProfile.id === userId ? profileQuery.data.playerProfile : undefined;

    const selectTab = (selected: ProfileTab) => setSearchParams({ tab: selected }, { replace: true });

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

    const panels: Record<ProfileTab, ReactNode> = {
        // another player starts with the first page of their history
        history: <PlayerHistory key={userId} userId={userId} />,
        ladder: <ProfileSoon title={t('profile.tabs.ladder')} text={t('profile.ladderSoon')} />,
        guilds:
            <div className="player-profile__guilds">
                {
                    profile.guilds.length || profile.otherGuildsCount ?
                    <PlayerGuilds guilds={profile.guilds} otherGuildsCount={profile.otherGuildsCount} />
                    :
                    <div className="player-profile__empty">{t('profile.noGuilds')}</div>
                }
            </div>,
        games: <ProfileSoon title={t('profile.tabs.games')} text={t('profile.gamesSoon')} />,
    };

    return(
        <div className="player-profile">
            <ProfileHero profile={profile} />
            <DsTabs
                label={t('profile.tabs.label')}
                className="player-profile__tabs"
                value={tab}
                onChange={selectTab}
                tabs={(Object.keys(TAB_LABELS) as ProfileTab[]).map(id => ({
                    id,
                    label: t(TAB_LABELS[id]),
                    icon: <img src={id === tab ? TAB_ICONS[id].active : TAB_ICONS[id].icon} alt="" width={20} height={20} />,
                    tabId: `profile-tab-${id}`,
                    panelId: 'profile-panel',
                }))}
            />
            <div role="tabpanel" id="profile-panel" aria-labelledby={`profile-tab-${tab}`} className="player-profile__panel">
                {panels[tab]}
            </div>
        </div>
    );
}

export { PlayerProfilePage }
