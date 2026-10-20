import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Chip, CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { EVENT_STATUS_COLOR, EVENT_STATUS_NAME, EventStatus } from "root/shared/constants";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { PlayerHistoryItem, PlayerHistoryRecord, useGetPlayerHistoryQuery } from "../../playersApi";
import { playerProfilePath } from "../../playerProfilePath";
import './styles.scss';

// events of the player, newest first, next page is loaded when the end of the list is reached;
// the parent remounts it for another player or guild, so paging starts over
const PlayerHistory = ({ userId, guildId }: PlayerHistoryProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [startFrom, setStartFrom] = useState(0);
    const history = useGetPlayerHistoryQuery({ userId, guildId, startFrom }, { refetchOnMountOrArgChange: true });
    const listEnd = useRef<HTMLDivElement>(null);
    const items = history.data?.historyItems ?? [];
    const canLoadMore = !!history.data?.hasMore && !history.isFetching && !history.isError;

    useEffect(() => {
        if(!canLoadMore || !listEnd.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if(entry.isIntersecting) {
                setStartFrom(items.length);
            }
        });
        observer.observe(listEnd.current);
        return () => observer.disconnect();
    }, [canLoadMore, items.length]);

    const formatDate = (date: string, withYear: boolean) =>
        new Date(date).toLocaleString(i18n.language, { day: 'numeric', month: 'long', year: withYear ? 'numeric' : undefined });

    const renderResult = (record: PlayerHistoryRecord, item: PlayerHistoryItem) => {
        if(record.reward !== null) {
            return <div className="player-history__result player-history__result--success">{record.reward}/3</div>;
        }

        return item.statusId === EventStatus.Finished ?
            <div className="player-history__result player-history__result--failed">{t('Not completed')}</div>
            :
            <div className="player-history__result player-history__result--progress">{t('In progress')}</div>;
    }

    const renderRecord = (title: string, partnerCaption: string, record: PlayerHistoryRecord | null, item: PlayerHistoryItem) => {
        const partner = record?.partner;
        return(
            <div className="player-history__record">
                <div className="player-history__record-title">{title}</div>
                {
                    record?.game ?
                    <div className="player-history__record-body">
                        {
                            record.game.imageUrl ?
                            <img src={resolveImageUrl(record.game.imageUrl)} className="player-history__game-image" />
                            :
                            <div className="player-history__game-image player-history__game-image--empty" title={t('No Image')}>
                                <ImageNotSupportedOutlined />
                            </div>
                        }
                        <div className="player-history__record-info">
                            <div className="player-history__game-name">{record.game.name}</div>
                            {
                                partner &&
                                <div className="player-history__partner"
                                    onClick={() => navigate(playerProfilePath(partner.id, guildId))}
                                >
                                    {partnerCaption}
                                    <img src={partner.avatarUrl ?? undefined} className="player-history__partner-avatar" />
                                    <span className="player-history__partner-name">{partner.userName}</span>
                                </div>
                            }
                            {renderResult(record, item)}
                        </div>
                    </div>
                    :
                    <div className="player-history__no-game">
                        {item.statusId === EventStatus.Finished ? t('Game was not chosen') : t('Game is not chosen yet')}
                    </div>
                }
            </div>
        );
    }

    return(
        <div className="player-history">
            {
                items.map(item =>
                    <div key={item.eventId} className="player-history__item">
                        <div className="player-history__event">
                            <div className="player-history__event-title">
                                <div className="player-history__event-name"
                                    onClick={() => navigate(`/guild/${item.guildId}/event/${item.eventId}`)}
                                >
                                    {item.eventName}
                                </div>
                                <Chip sx={{ fontSize: "medium" }} label={t(EVENT_STATUS_NAME[item.statusId])} color={EVENT_STATUS_COLOR[item.statusId]} />
                            </div>
                            <div className="player-history__event-details">
                                {
                                    !guildId &&
                                    <span className="player-history__guild">
                                        {item.guildIconUrl && <img src={item.guildIconUrl} className="player-history__guild-icon" />}
                                        {item.guildName}
                                    </span>
                                }
                                <span>{formatDate(item.startDate, false)} – {formatDate(item.endDate, true)}</span>
                            </div>
                        </div>
                        {renderRecord(t('Received game'), t('from'), item.receivedGame, item)}
                        {renderRecord(t('Guessed game'), t('for'), item.suggestedGame, item)}
                    </div>
                )
            }
            {
                history.isSuccess && items.length === 0 &&
                <div className="player-history__empty">{t('No events yet')}</div>
            }
            <div ref={listEnd} className="player-history__loader">
                {history.isFetching && <CircularProgress color="primary" />}
            </div>
        </div>
    );
}

type PlayerHistoryProps = {
    userId: string,
    guildId?: string
}

export { PlayerHistory }
