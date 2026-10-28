import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { badgeImageUrl } from "root/features/globalEvents/badges";
import { globalEventPath } from "root/features/globalEvents/globalEventPath";
import { PlayerBadge } from "../../playersApi";
import './styles.scss';

// the badges of the passed global events, each one separately with its event and date, leading to the event
const PlayerBadges = ({ badges }: PlayerBadgesProps) => {
    const { t, i18n } = useTranslation();
    // the badges whose image didn't load, they still count
    const [brokenIds, setBrokenIds] = useState<string[]>([]);

    if(!badges.length) {
        return <div className="player-badges__empty">{t('No achievements yet')}</div>;
    }

    return(
        <div className="player-badges">
            {
                badges.map(badge => {
                    const title = t('«{{name}}» passed on {{date}}', {
                        name: badge.globalEventName,
                        date: new Date(badge.passedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
                    });
                    return(
                        <Tooltip key={badge.globalEventId} title={title} arrow slotProps={{ tooltip: { sx: { fontSize: 14 } } }}>
                            <Link to={globalEventPath(badge.globalEventId)} className="player-badges__badge" aria-label={title}>
                                {
                                    brokenIds.includes(badge.badgeId) ?
                                    <EmojiEvents className="player-badges__image player-badges__image--missing" />
                                    :
                                    <img
                                    src={badgeImageUrl(badge.badgeId)}
                                    className="player-badges__image"
                                    alt=""
                                    onError={() => setBrokenIds(ids => [...ids, badge.badgeId])} />
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
