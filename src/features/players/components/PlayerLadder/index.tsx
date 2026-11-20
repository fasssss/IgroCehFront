import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { DsButton } from "root/shared/components/DsButton";
import { SoonLabel } from "root/shared/components/SoonLabel";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useGetActiveGlobalEventQuery } from "root/features/globalEvents/globalEventsApi";
import { globalEventPath } from "root/features/globalEvents/globalEventPath";
import { FestPassingActions } from "root/features/globalEvents/components/FestPassingActions";
import iconGamepad from "root/assets/design/icon-gamepad.svg";
import freeSlot from "root/assets/design/ladder-free-slot.svg";
import { PlayerFestGame, useGetPlayerLadderQuery } from "../../playersApi";
import './styles.scss';

// the ladder tab of the profile (layout 20674:3866): the games played now — the Igrofest one (a global event)
// and the Regular roster that isn't made yet — and the passed Igrofest games
const PlayerLadder = ({ userId, isOwn }: PlayerLadderProps) => {
    const { t, i18n } = useTranslation();
    const ladder = useGetPlayerLadderQuery(userId, { refetchOnMountOrArgChange: true });
    const activeGlobalEvent = useGetActiveGlobalEventQuery().data?.globalEvent;
    const { refetch } = ladder;
    const onPassed = useCallback(() => { refetch(); }, [refetch]);
    const fest = ladder.data?.fest;

    const fullDate = (date: string | null) =>
        date ? new Date(date).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;

    const renderCover = (game: PlayerFestGame['game'], className: string) =>
        game.imageUrl ?
        <img src={resolveImageUrl(game.imageUrl)} className={className} alt="" />
        :
        <span className={`${className} player-ladder__cover--empty`} title={t('No Image')}><ImageNotSupportedOutlined /></span>;

    const renderCurrent = (current: PlayerFestGame) =>
        <div className="player-ladder__row">
            <div className="player-ladder__game">
                {renderCover(current.game, "player-ladder__cover player-ladder__cover--game")}
                <div className="player-ladder__game-text">
                    <div className="player-ladder__game-name">{current.game.name}</div>
                    <Link to={globalEventPath(current.globalEventId)} className="player-ladder__game-event">
                        {t('ladder.festOf', { name: current.globalEventName })}
                    </Link>
                    <div className="player-ladder__game-date">{fullDate(current.pickedAt)}</div>
                </div>
            </div>
            {isOwn && <FestPassingActions globalEventId={current.globalEventId} onPassed={onPassed} />}
        </div>;

    const renderFreeSlot = () =>
        <div className="player-ladder__row">
            <div className="player-ladder__game">
                <img src={freeSlot} className="player-ladder__cover" alt="" width={104} height={104} />
                <div className="player-ladder__free">{t('ladder.freeSlot')}</div>
            </div>
            {
                isOwn && activeGlobalEvent &&
                <DsButton size="large" uppercase icon={<img src={iconGamepad} alt="" />} to={globalEventPath(activeGlobalEvent.id)}
                    className="player-ladder__take"
                >
                    {t('ladder.takeGame')}
                </DsButton>
            }
        </div>;

    return(
        <div className="player-ladder">
            <h2 className="player-ladder__heading">
                1 <span className="player-ladder__heading-slash">/</span> {isOwn ? t('ladder.currentMine') : t('ladder.current')}
            </h2>
            <div className="player-ladder__body">
                <section className="player-ladder__group">
                    <h3 className="player-ladder__group-title">{t('ladder.fest')}<span className="player-ladder__group-line" aria-hidden /></h3>
                    {
                        !fest ?
                        <div className="player-ladder__loader"><CircularProgress color="primary" /></div>
                        :
                        fest.current ? renderCurrent(fest.current) : renderFreeSlot()
                    }
                </section>
                <section className="player-ladder__group">
                    <h3 className="player-ladder__group-title">{t('ladder.regular')}<span className="player-ladder__group-line" aria-hidden /></h3>
                    <div className="player-ladder__row player-ladder__row--soon">
                        <div className="player-ladder__game">
                            <img src={freeSlot} className="player-ladder__cover" alt="" width={104} height={104} />
                            <div className="player-ladder__free">{t('ladder.regularSoon')} <SoonLabel /></div>
                        </div>
                    </div>
                </section>
            </div>
            <h2 className="player-ladder__heading">
                2 <span className="player-ladder__heading-slash">/</span> {t('ladder.history')}
            </h2>
            <div className="player-ladder__body">
                {
                    fest && (
                        fest.passed.length ?
                        <ol className="player-ladder__history">
                            {
                                fest.passed.map((passed, index) =>
                                    <li key={passed.globalEventId} className="player-ladder__passed">
                                        <span className="player-ladder__passed-number">{index + 1}</span>
                                        <Link to={globalEventPath(passed.globalEventId)} className="player-ladder__card"
                                            title={`${t('ladder.festOf', { name: passed.globalEventName })} · ${fullDate(passed.passedAt)}`}
                                        >
                                            {renderCover(passed.game, "player-ladder__card-cover")}
                                            <span className="player-ladder__card-name">{passed.game.name}</span>
                                        </Link>
                                        <span className="player-ladder__passed-status">{t('ladder.passed')}</span>
                                    </li>
                                )
                            }
                        </ol>
                        :
                        <p className="player-ladder__empty">{t('ladder.noPassed')}</p>
                    )
                }
            </div>
        </div>
    );
}

type PlayerLadderProps = {
    userId: string,
    // the owner proves the passing of the current game and takes a game into a free slot
    isOwn: boolean
}

export { PlayerLadder }
