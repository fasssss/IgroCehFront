import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PlayerGuildObject } from "../../playersApi";
import './styles.scss';

const VISIBLE_GUILDS_COUNT = 3;

// guilds come sorted by score, only the best ones are shown until the list is expanded;
// guilds of the player without the current user are only counted, their score is still in the totals
const PlayerGuilds = ({ guilds, otherGuildsCount, onSelect }: PlayerGuildsProps) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const shownGuilds = isExpanded ? guilds : guilds.slice(0, VISIBLE_GUILDS_COUNT);

    return(
        <div className="player-guilds">
            {
                shownGuilds.map(guild =>
                    <div key={guild.id} className="player-guilds__row" onClick={() => onSelect(guild.id)}>
                        <div className="player-guilds__name">
                            {guild.iconUrl && <img src={guild.iconUrl} className="player-guilds__icon" />}
                            {guild.name}
                            {guild.hasLeft && <span className="player-guilds__left">{t('Left the guild')}</span>}
                        </div>
                        <div className="player-guilds__score">
                            <span>{t('{{count}} points', { count: guild.score })}</span>
                            <span className="player-guilds__place">
                                #{guild.place} {t('of {{count}} players', { count: guild.playersCount })}
                            </span>
                        </div>
                    </div>
                )
            }
            {
                !isExpanded && guilds.length > VISIBLE_GUILDS_COUNT &&
                <button className="player-guilds__show-all" onClick={() => setIsExpanded(true)}>
                    {t('Show all')}
                </button>
            }
            {
                otherGuildsCount > 0 &&
                <div className="player-guilds__others">
                    {t('Plays in {{count}} more guilds you are not in', { count: otherGuildsCount })}
                </div>
            }
        </div>
    );
}

type PlayerGuildsProps = {
    guilds: PlayerGuildObject[],
    otherGuildsCount: number,
    onSelect: (guildId: string) => void
}

export { PlayerGuilds }
