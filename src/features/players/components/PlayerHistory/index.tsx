import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { EVENT_STATUS_NAME, EventStatus } from "root/shared/constants";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { seasonOf } from "root/features/events/seasons";
import { PlayerHistoryItem, PlayerHistoryRecord, useGetPlayerHistoryQuery } from "../../playersApi";
import { playerProfilePath } from "../../playerProfilePath";
import './styles.scss';

const DAY_MS = 24 * 60 * 60 * 1000;

// the events of the player, newest first, a row per event (layout 20648:852): the event in the color of its season,
// the game the player guessed and the game they got with its result; the next page loads at the end of the list,
// the parent remounts it for another player, so paging starts over
const PlayerHistory = ({ userId }: PlayerHistoryProps) => {
    const { t, i18n } = useTranslation();
    const [startFrom, setStartFrom] = useState(0);
    const history = useGetPlayerHistoryQuery({ userId, startFrom }, { refetchOnMountOrArgChange: true });
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

    const shortDate = (date: string) =>
        new Date(date).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' });

    const renderStatus = (item: PlayerHistoryItem) => {
        if(item.statusId === EventStatus.Active) {
            const daysLeft = Math.max(0, Math.ceil((new Date(item.endDate).getTime() - Date.now()) / DAY_MS));
            return(
                <span className="player-history__status player-history__status--active">
                    {t('history.active')}
                    <span className="player-history__status-pill">{t('history.days', { count: daysLeft })}</span>
                </span>
            );
        }

        if(item.statusId === EventStatus.Finished) {
            return(
                <span className="player-history__status player-history__status--finished">
                    {t('history.finished')}
                    <span className="player-history__status-pill">{shortDate(item.endDate)}</span>
                </span>
            );
        }

        // the event hasn't started yet: registration, guessing and the other stages before it
        return(
            <span className="player-history__status player-history__status--upcoming">
                {t(EVENT_STATUS_NAME[item.statusId])}
                <span className="player-history__status-pill">{shortDate(item.startDate)}</span>
            </span>
        );
    }

    const renderGame = (record: PlayerHistoryRecord | null, partnerCaption: string, area: string) => {
        if(!record?.game) {
            return <div className={`player-history__game player-history__game--${area}`} />;
        }

        const { game, partner } = record;
        return(
            <div className={`player-history__game player-history__game--${area}`}>
                <div className="player-history__game-text">
                    <div className="player-history__game-name">{game.name}</div>
                    {
                        partner &&
                        <div className="player-history__partner">
                            {partnerCaption}{' '}
                            <Link to={playerProfilePath(partner.id)} className="player-history__partner-name">{partner.userName}</Link>
                        </div>
                    }
                </div>
                {
                    game.imageUrl ?
                    <img src={resolveImageUrl(game.imageUrl)} className="player-history__cover" alt="" width={56} height={56} />
                    :
                    <span className="player-history__cover player-history__cover--empty" title={t('No Image')}>
                        <ImageNotSupportedOutlined />
                    </span>
                }
            </div>
        );
    }

    const renderGuessedResult = (item: PlayerHistoryItem) => {
        if(item.isNewcomer) {
            return <span className="player-history__result player-history__result--muted">{t('history.newcomer')}</span>;
        }

        return item.suggestedGame?.game ?
            <span className="player-history__result">{t('history.guessed')}</span>
            :
            <span className="player-history__result player-history__result--muted">
                {item.statusId === EventStatus.Finished ? t('Game was not chosen') : t('Game is not chosen yet')}
            </span>;
    }

    const renderReceivedResult = (item: PlayerHistoryItem) => {
        const record = item.receivedGame;
        if(!record?.game) {
            return(
                <span className="player-history__result player-history__result--muted">
                    {item.statusId === EventStatus.Finished ? t('Game was not chosen') : t('Game is not chosen yet')}
                </span>
            );
        }

        if(record.reward !== null) {
            return(
                <span className="player-history__result player-history__result--success">
                    <span className="player-history__reward" aria-hidden>{record.reward}</span>
                    <span className="visually-hidden">{record.reward}</span>
                    {t('history.points', { count: record.reward })}
                </span>
            );
        }

        return item.statusId === EventStatus.Finished ?
            <span className="player-history__result player-history__result--failed">{t('Not completed')}</span>
            :
            <span className="player-history__result player-history__result--pending">{t('history.notPassedYet')}</span>;
    }

    return(
        <div className="player-history">
            {
                items.map(item => {
                    // the cover of the game the player got lights the row up on hover
                    const cover = item.receivedGame?.game?.imageUrl ?? item.suggestedGame?.game?.imageUrl;
                    return(
                        <article key={item.eventId} className="player-history__item">
                            {
                                cover &&
                                <div className="player-history__backdrop" aria-hidden>
                                    <div className="player-history__backdrop-image" style={{ backgroundImage: `url("${resolveImageUrl(cover)}")` }} />
                                    <div className="player-history__backdrop-shade" />
                                </div>
                            }
                            <div className="player-history__grid">
                                <h3 className="player-history__event">
                                    <Link to={`/guild/${item.guildId}/event/${item.eventId}`}
                                        className={`player-history__event-name player-history__event-name--${seasonOf(item.startDate)}`}
                                    >
                                        {item.eventName}
                                    </Link>
                                </h3>
                                {
                                    item.isNewcomer ?
                                    <div className="player-history__game player-history__game--guessed" />
                                    :
                                    renderGame(item.suggestedGame, t('history.forPlayer'), 'guessed')
                                }
                                {renderGame(item.receivedGame, t('history.fromPlayer'), 'received')}
                                <div className="player-history__line" aria-hidden />
                                <div className="player-history__meta">
                                    {renderStatus(item)}
                                    <span className="player-history__meta-line" aria-hidden />
                                    <span className="player-history__guild">
                                        {
                                            item.guildIconUrl ?
                                            <img src={item.guildIconUrl} className="player-history__guild-icon" alt="" width={32} height={32} />
                                            :
                                            <span className="player-history__guild-icon player-history__guild-icon--empty" />
                                        }
                                        {item.guildName}
                                    </span>
                                </div>
                                <div className="player-history__outcome player-history__outcome--guessed">{renderGuessedResult(item)}</div>
                                <div className="player-history__outcome player-history__outcome--received">{renderReceivedResult(item)}</div>
                            </div>
                        </article>
                    );
                })
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
    userId: string
}

export { PlayerHistory }
