import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { DsButton } from "root/shared/components/DsButton";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { reviewPath } from "root/features/reviews/reviewPath";
import { ReviewScore } from "root/features/reviews/components/ReviewScore";
import { PlayerGame, PlayerGamesKind, PlayerGamesSort, useGetPlayerGamesQuery } from "../../playersApi";
import { playerProfilePath } from "../../playerProfilePath";
import './styles.scss';

// the tab "Мои игры" of the profile (layout 20648:1641): the games the player passed with their reviews and scores,
// and the games they guessed for others
const PlayerGames = ({ userId }: PlayerGamesProps) => {
    const { t } = useTranslation();
    return(
        <div className="player-games">
            <GamesList userId={userId} kind={PlayerGamesKind.Passed} title={t('games.passed')} />
            <GamesList userId={userId} kind={PlayerGamesKind.Guessed} title={t('games.guessed')} />
        </div>
    );
}

// one column: a page of games after another by "Показать ещё", the passed ones can be sorted by the score
const GamesList = ({ userId, kind, title }: GamesListProps) => {
    const { t, i18n } = useTranslation();
    const [sort, setSort] = useState<PlayerGamesSort>(PlayerGamesSort.Latest);
    const [startFrom, setStartFrom] = useState(0);
    const games = useGetPlayerGamesQuery({ userId, kind, sort, startFrom }, { refetchOnMountOrArgChange: true });
    const items = games.data?.games ?? [];
    const isPassed = kind === PlayerGamesKind.Passed;

    const changeSort = (value: PlayerGamesSort) => {
        setSort(value);
        setStartFrom(0);
    };

    const date = (game: PlayerGame) =>
        game.date ? new Date(game.date).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;

    const renderSortOption = (value: PlayerGamesSort, label: string) =>
        <button type="button" className={`player-games__sort-option ${sort === value ? 'player-games__sort-option--active' : ''}`}
            aria-pressed={sort === value} onClick={() => changeSort(value)}
        >
            {label}
        </button>;

    return(
        <section className="player-games__column">
            <header className="player-games__header">
                <h2 className="player-games__title">{title}</h2>
                {
                    isPassed &&
                    <div className="player-games__sort" role="group" aria-label={t('games.sort')}>
                        {renderSortOption(PlayerGamesSort.Latest, t('games.latest'))}
                        {renderSortOption(PlayerGamesSort.Score, t('games.byScore'))}
                    </div>
                }
            </header>
            {
                games.isSuccess && items.length === 0 ?
                <p className="player-games__empty">{isPassed ? t('games.noPassed') : t('games.noGuessed')}</p>
                :
                <ol className="player-games__list">
                    {
                        items.map((item, index) =>
                            <li key={item.eventRecordId} className="player-games__row">
                                <span className="player-games__number">{index + 1}</span>
                                {
                                    item.game.imageUrl ?
                                    <img src={resolveImageUrl(item.game.imageUrl)} className="player-games__cover" alt="" width={56} height={56} />
                                    :
                                    <span className="player-games__cover player-games__cover--empty"><ImageNotSupportedOutlined /></span>
                                }
                                <div className="player-games__game">
                                    <div className="player-games__name">{item.game.name}</div>
                                    <div className="player-games__event">{item.eventName} — {date(item)}</div>
                                </div>
                                {
                                    item.partner &&
                                    <div className="player-games__partner">
                                        <span className="player-games__partner-caption">{isPassed ? t('history.fromPlayer') : t('history.forPlayer')}</span>
                                        <Link to={playerProfilePath(item.partner.id)} className="player-games__partner-name">{item.partner.userName}</Link>
                                        {
                                            !isPassed &&
                                            (item.partner.avatarUrl ?
                                                <img src={item.partner.avatarUrl} className="player-games__avatar" alt="" width={40} height={40} />
                                                :
                                                <span className="player-games__avatar player-games__avatar--empty" />)
                                        }
                                    </div>
                                }
                                {
                                    isPassed &&
                                    <>
                                        {
                                            item.reviewId ?
                                            <Link to={reviewPath(item.eventRecordId)} className="player-games__review">{t('games.review')}</Link>
                                            :
                                            <span className="player-games__review player-games__review--none" />
                                        }
                                        <span className="player-games__score">
                                            {item.score !== null ? <ReviewScore score={item.score} /> : <span className="player-games__no-score">—</span>}
                                        </span>
                                    </>
                                }
                            </li>
                        )
                    }
                </ol>
            }
            {games.isFetching && <div className="player-games__loader"><CircularProgress color="primary" /></div>}
            {
                games.data?.hasMore && !games.isFetching &&
                <DsButton uppercase fullWidth onClick={() => setStartFrom(items.length)}>{t('games.showMore')}</DsButton>
            }
        </section>
    );
}

type PlayerGamesProps = {
    userId: string
}

type GamesListProps = {
    userId: string,
    kind: PlayerGamesKind,
    title: string
}

export { PlayerGames }
