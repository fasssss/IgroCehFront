import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { badgeUrl } from "root/features/globalEvents/badges";
import { globalEventPath } from "root/features/globalEvents/globalEventPath";
import { PlayerBadge } from "../../playersApi";
import './styles.scss';

// the badges of the passed global events, each one separately with its event and date, leading to the event
const PlayerBadges = ({ badges }: PlayerBadgesProps) => {
    const { t, i18n } = useTranslation();

    if(!badges.length) {
        return <div className="player-badges__empty">{t('No achievements yet')}</div>;
    }

    return(
        <div className="player-badges">
            {
                badges.map(badge => {
                    const url = badgeUrl(badge.badgeId);
                    const title = t('«{{name}}» passed on {{date}}', {
                        name: badge.globalEventName,
                        date: new Date(badge.passedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
                    });
                    return(
                        <Tooltip key={badge.globalEventId} title={title} arrow slotProps={{ tooltip: { sx: { fontSize: 14 } } }}>
                            <Link to={globalEventPath(badge.globalEventId)} className="player-badges__badge" aria-label={title}>
                                {
                                    url ?
                                    <img src={url} className="player-badges__image" alt="" />
                                    :
                                    // the image is gone from the front, the badge still counts
                                    <EmojiEvents className="player-badges__image player-badges__image--missing" />
                                }
                            </Link>
                        </Tooltip>
                    );
                })
            }
        </div>
    );
};

type PlayerBadgesProps = {
    badges: PlayerBadge[]
}

export { PlayerBadges }
