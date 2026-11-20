import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { SoonLabel } from "root/shared/components/SoonLabel";
import { TagPill } from "root/shared/components/TagPill";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { SteamAccount } from "root/features/steam/components/SteamAccount";
import { XboxAccount } from "root/features/xbox/components/XboxAccount";
import { PsnAccount } from "root/features/psn/components/PsnAccount";
import { SteamProfileWarning } from "root/features/steam/components/SteamProfileWarning";
import { PlayerProfileObject } from "../../playersApi";
import { platformColor } from "../../platformColors";
import { PlayerBadges } from "../PlayerBadges";
import { RewardsBar } from "../RewardsBar";
import { ProfileSection } from "../ProfileSection";
import { ProfileAspects } from "../ProfileAspects";
import { ProfileGenres } from "../ProfileGenres";
import './styles.scss';

const StatTile = ({ value, caption }: StatTileProps) => {
    return(
        <div className="profile-hero__stat">
            <div className="profile-hero__stat-value">{value}</div>
            <div className="profile-hero__stat-caption">{caption}</div>
        </div>
    );
}

// the top of the player profile (layouts 20648:706 and 20674:3877): the name with the badges and the accounts,
// the points for the finished games, the statistics of every shared guild, the platforms, the liked aspects and the genres
const ProfileHero = ({ profile }: ProfileHeroProps) => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const isOwn = currentUser?.id === profile.id;
    const { statistics } = profile;
    const finishedEvents = statistics.eventsPlayed - statistics.eventsInProgress;

    return(
        <section className="profile-hero">
            <div className="profile-hero__main">
                <div className="profile-hero__identity">
                    <div className="profile-hero__name-group">
                        {
                            profile.avatarUrl ?
                            <img src={profile.avatarUrl} className="profile-hero__avatar" alt="" width={64} height={64} />
                            :
                            <span className="profile-hero__avatar profile-hero__avatar--default">
                                <SvgIcon fontSize="large"><SvgSelector iconName='discord-icon' /></SvgIcon>
                            </span>
                        }
                        <h1 className="profile-hero__name">{profile.userName}</h1>
                        <PlayerBadges badges={profile.badges} />
                    </div>
                    <div className="profile-hero__accounts">
                        <SteamAccount userId={profile.id} steamId={profile.steamId} />
                        <XboxAccount userId={profile.id} gamertag={profile.xboxGamertag} />
                        <PsnAccount userId={profile.id} onlineId={profile.psnOnlineId} />
                    </div>
                </div>
                {
                    // the owner learns that Steam won't give their achievements
                    isOwn && currentUser.steamId &&
                    <SteamProfileWarning className="profile-hero__steam-warning" />
                }
                <div className="profile-hero__summary">
                    <RewardsBar rewards={statistics.rewards} failedCount={statistics.gamesFailed} />
                    <div className="profile-hero__stats">
                        <StatTile value={t('profile.points', { count: statistics.score })} caption={t('profile.pointsCaption')} />
                        <StatTile value={t('profile.place')}
                            caption={<>{t('profile.inLadder')} <SoonLabel /></>}
                        />
                        <StatTile value={t('profile.events', { count: finishedEvents })} caption={t('profile.eventsCaption')} />
                        <StatTile value={t('profile.games', { count: statistics.gamesCompleted })} caption={t('profile.gamesCaption')} />
                    </div>
                </div>
            </div>
            <aside className="profile-hero__side">
                {
                    profile.favoritePlatforms.length > 0 &&
                    <ProfileSection title={isOwn ? t('profile.myPlatforms') : t('profile.platforms')} className="profile-hero__section">
                        <ul className="profile-section__tags">
                            {
                                profile.favoritePlatforms.map(({ platform, count }) =>
                                    <li key={platform}>
                                        <TagPill color={platformColor(platform)} title={t('{{label}}: {{count}} games', { label: platform, count })}>
                                            {platform}
                                        </TagPill>
                                    </li>
                                )
                            }
                        </ul>
                    </ProfileSection>
                }
                <ProfileAspects userId={profile.id} isOwn={isOwn} className="profile-hero__section" />
                <ProfileGenres userId={profile.id} isOwn={isOwn} className="profile-hero__section" />
            </aside>
        </section>
    );
}

type StatTileProps = {
    value: ReactNode,
    caption: ReactNode
}

type ProfileHeroProps = {
    profile: PlayerProfileObject
}

export { ProfileHero }
