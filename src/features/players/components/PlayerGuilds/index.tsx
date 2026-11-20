import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { PlayerGuildObject } from "../../playersApi";
import './styles.scss';

// the tab "Сообщества" of the profile (no layout, in the style of the tiles of the hero): the guilds shared with
// the player sorted by score, each leading to its page; the guilds without the current user are only counted
const PlayerGuilds = ({ guilds, otherGuildsCount }: PlayerGuildsProps) => {
    const { t } = useTranslation();

    return(
        <div className="player-guilds">
            {
                guilds.length > 0 &&
                <ul className="player-guilds__list">
                    {
                        guilds.map(guild =>
                            <li key={guild.id}>
                                <Link to={`/guild/${guild.id}`} className="player-guilds__row">
                                    <span className="player-guilds__name">
                                        {
                                            guild.iconUrl ?
                                            <img src={guild.iconUrl} className="player-guilds__icon" alt="" width={48} height={48} />
                                            :
                                            <span className="player-guilds__icon player-guilds__icon--empty" />
                                        }
                                        {guild.name}
                                        {guild.hasLeft && <span className="player-guilds__left">{t('Left the guild')}</span>}
                                    </span>
                                    <span className="player-guilds__stat">
                                        <span className="player-guilds__value">{t('profile.points', { count: guild.score })}</span>
                                        <span className="player-guilds__caption">{t('profile.pointsCaption')}</span>
                                    </span>
                                    <span className="player-guilds__stat">
                                        <span className="player-guilds__value">#{guild.place}</span>
                                        <span className="player-guilds__caption">{t('of {{count}} players', { count: guild.playersCount })}</span>
                                    </span>
                                </Link>
                            </li>
                        )
                    }
                </ul>
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
    otherGuildsCount: number
}

export { PlayerGuilds }
