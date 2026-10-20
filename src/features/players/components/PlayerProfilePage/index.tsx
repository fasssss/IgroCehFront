import { ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, SvgIcon, Tooltip } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { CommonButton } from "root/shared/components/CommonButton";
import { Pills } from "root/shared/components/Pills";
import { toPlatformPill } from "root/features/events/platformPills";
import { useGetPlayerProfileQuery } from "../../playersApi";
import { playerProfilePath } from "../../playerProfilePath";
import { RewardsBar } from "../RewardsBar";
import { PlayerGuilds } from "../PlayerGuilds";
import { PlayerHistory } from "../PlayerHistory";
import './styles.scss';

const StatTile = ({ label, value, note }: StatTileProps) => {
    return(
        <div className="player-profile__stat">
            <div className="player-profile__stat-label">{label}</div>
            <div className="player-profile__stat-value">{value}</div>
            {note && <div className="player-profile__stat-note">{note}</div>}
        </div>
    );
}

// statistics of every guild of the player, or of a shared guild selected by ?guild=
const PlayerProfilePage = () => {
    const { userId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const guildId = searchParams.get('guild') ?? undefined;
    const { t, i18n } = useTranslation();
    const profileQuery = useGetPlayerProfileQuery({ userId, guildId }, { refetchOnMountOrArgChange: true });
    // data of the previous guild stays on screen while another one is loading, data of another player doesn't
    const profile = profileQuery.data?.playerProfile.id === userId ? profileQuery.data.playerProfile : undefined;

    const selectGuild = (selectedGuildId?: string) =>
        setSearchParams(selectedGuildId ? { guild: selectedGuildId } : {}, { replace: true });

    if(profileQuery.isError) {
        const isNotFound = 'status' in profileQuery.error && profileQuery.error.status === 404;
        return(
            <div className="player-profile__message">
                <h2>{isNotFound ? t('Player not found or you have no guilds in common') : t("Couldn't load the profile")}</h2>
                {
                    isNotFound && guildId &&
                    <CommonButton color="success" onClick={() => selectGuild()}>
                        {t('Show all guilds')}
                    </CommonButton>
                }
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

    // a guild where the player hasn't played isn't offered (e.g. a link from the leaderboard), all guilds are shown instead
    if(guildId && !profile.guilds.some(guild => guild.id === guildId)) {
        return <Navigate to={playerProfilePath(profile.id)} replace />;
    }

    const { statistics } = profile;
    const selectedGuild = profile.guilds.find(guild => guild.id === guildId);
    const averageDays = statistics.averageDaysToComplete;

    return(
        <div className="player-profile">
            <div className="player-profile__header">
                {
                    profile.avatarUrl ?
                    <img src={profile.avatarUrl} className="player-profile__avatar" />
                    :
                    <div className="player-profile__avatar player-profile__avatar--default">
                        <SvgIcon fontSize="large"><SvgSelector iconName='discord-icon' /></SvgIcon>
                    </div>
                }
                <div className="player-profile__identity">
                    <div className="player-profile__name-row">
                        <h1 className="player-profile__name">{profile.userName}</h1>
                        {
                            profile.favoritePlatforms.length > 0 &&
                            <div className="player-profile__platforms" title={t('Favorite platforms')} aria-label={t('Favorite platforms')}>
                                <Pills items={profile.favoritePlatforms.map(({ platform, count }) => toPlatformPill(platform, `${platform} · ${count}`))} />
                            </div>
                        }
                    </div>
                    {
                        profile.playingSince &&
                        <div className="player-profile__since">
                            {t('Playing since {{date}}', {
                                date: new Date(profile.playingSince).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
                            })}
                        </div>
                    }
                </div>
            </div>
            {
                profile.guilds.length > 0 &&
                <div className="player-profile__guild-switcher">
                    <button
                        className={`player-profile__guild-option ${!guildId ? 'player-profile__guild-option--selected' : ''}`}
                        onClick={() => selectGuild()}
                    >
                        {t('All guilds')}
                    </button>
                    {
                        profile.guilds.map(guild =>
                            <button key={guild.id}
                                className={`player-profile__guild-option ${guild.id === guildId ? 'player-profile__guild-option--selected' : ''}`}
                                onClick={() => selectGuild(guild.id)}
                            >
                                {guild.iconUrl && <img src={guild.iconUrl} className="player-profile__guild-icon" />}
                                {guild.name}
                            </button>
                        )
                    }
                </div>
            }
            <div className={`player-profile__body ${profileQuery.isFetching ? 'player-profile__body--updating' : ''}`}>
                <div className="player-profile__stats">
                    <StatTile label={t('Score')} value={statistics.score} />
                    {
                        selectedGuild &&
                        <StatTile label={t('Place')}
                            value={`#${selectedGuild.place}`}
                            note={t('of {{count}} players', { count: selectedGuild.playersCount })}
                        />
                    }
                    <StatTile label={t('Events')}
                        value={statistics.eventsPlayed}
                        note={statistics.eventsInProgress > 0 && t('{{count}} in progress', { count: statistics.eventsInProgress })}
                    />
                    <StatTile label={t('Completed games')}
                        value={statistics.gamesCompleted}
                        note={statistics.gamesFailed > 0 && t('Not completed: {{failed}}', { failed: statistics.gamesFailed })}
                    />
                    <StatTile label={t('Average completion time')}
                        value={
                            averageDays === null ? '—' :
                            <>
                                {averageDays.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                                {' '}
                                <span className="player-profile__stat-unit">{t('days', { count: averageDays })}</span>
                            </>
                        }
                        note={t('from the season start')}
                    />
                    <StatTile label={t('Guessed games')}
                        value={statistics.gamesSuggested}
                        note={statistics.gamesSuggested > 0 && t('Completed: {{completed}}', { completed: statistics.suggestedGamesCompleted })}
                    />
                </div>
                <div className="player-profile__panels">
                    <section className="player-profile__panel">
                        <h2 className="player-profile__panel-title">{t('Game results')}</h2>
                        <RewardsBar rewards={statistics.rewards} failedCount={statistics.gamesFailed} />
                    </section>
                    {
                        // the place in a selected guild is shown in its tile
                        !guildId && (profile.guilds.length > 0 || profile.otherGuildsCount > 0) &&
                        <section className="player-profile__panel">
                            <h2 className="player-profile__panel-title">{t('Guilds')}</h2>
                            {/* another player starts with the collapsed list */}
                            <PlayerGuilds key={userId} guilds={profile.guilds} otherGuildsCount={profile.otherGuildsCount} onSelect={selectGuild} />
                        </section>
                    }
                </div>
                {/* place for achievements until they are implemented */}
                <section className="player-profile__panel player-profile__achievements">
                    {t('Achievements will appear here soon')}
                </section>
                <h2 className="player-profile__history-title">
                    {t('History')}
                    <Tooltip title={t('History contains only guilds you are a member of too')} arrow placement="right"
                        slotProps={{ tooltip: { sx: { fontSize: 14 } } }}
                    >
                        <HelpOutline className="player-profile__history-hint" tabIndex={0} />
                    </Tooltip>
                </h2>
                <PlayerHistory key={`${userId}:${guildId ?? ''}`} userId={userId} guildId={guildId} />
            </div>
        </div>
    );
}

type StatTileProps = {
    label: string,
    value: ReactNode,
    note?: ReactNode
}

export { PlayerProfilePage }
