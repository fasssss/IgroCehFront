import { useEffect, useMemo, useRef, useState } from "react";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import type { GlobalEventGame } from "../../globalEventsApi";
import './styles.scss';

type RollGame = GlobalEventGame['game'];

// the reels run long enough to blur, the rolled game stands near the end of each
const REEL_LENGTH = 26;
const DROPPED_INDEX = 22;
// the reels stop one after another, from left to right
const SPIN_MS = [2600, 3400, 4200];
const REDUCED_MOTION_SPIN_MS = 300;

const RollItem = ({ game, className }: RollItemProps) =>
    <div className={`global-event-roll__item ${className ?? ""}`}>
        {
            game.imageUrl ?
            <img src={resolveImageUrl(game.imageUrl)} className="global-event-roll__cover" alt="" />
            :
            <div className="global-event-roll__cover global-event-roll__cover--empty">
                <ImageNotSupportedOutlined />
            </div>
        }
        <div className="global-event-roll__name">{game.name}</div>
    </div>;

type RollItemProps = {
    game: RollGame,
    className?: string
}

// a reel of covers runs up the window and stops on the game the server has rolled for it
const Reel = ({ games, dropped, spinMs, onStopped }: ReelProps) => {
    const strip = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
    // the other covers come in a random order, so every spin looks different; the reel is made once
    const [reelGames] = useState(() => Array.from({ length: REEL_LENGTH }, (_, index) =>
        index === DROPPED_INDEX ? dropped : games[Math.floor(Math.random() * games.length)]));

    useEffect(() => {
        const first = strip.current?.firstElementChild as HTMLElement | null;
        if(!strip.current || !first) return;
        const step = first.offsetHeight + parseFloat(getComputedStyle(strip.current).rowGap || '0');
        // the reel starts from its place, the move is animated on the next frame
        const frame = requestAnimationFrame(() => setOffset(DROPPED_INDEX * step));
        return () => cancelAnimationFrame(frame);
    }, []);

    return(
        <div className="global-event-roll__reel">
            {/* an unseen copy keeps the window one game tall, the strip runs over it */}
            <RollItem game={dropped} className="global-event-roll__item--placeholder" />
            <div
            ref={strip}
            className="global-event-roll__strip"
            style={{ transform: `translateY(${-offset}px)`, transitionDuration: `${spinMs}ms` }}
            onTransitionEnd={onStopped}>
                {reelGames.map((game, index) => <RollItem key={index} game={game} />)}
            </div>
        </div>
    );
};

type ReelProps = {
    games: RollGame[],
    dropped: RollGame,
    spinMs: number,
    onStopped: () => void
}

// one reel for every rolled game, the last one to stop ends the roll
const GlobalEventRoll = ({ games, rolled, onStopped }: GlobalEventRollProps) => {
    const isReducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

    return(
        <div className="global-event-roll">
            {
                rolled.map((game, index) =>
                    <Reel
                    key={index}
                    games={games}
                    dropped={game}
                    spinMs={isReducedMotion ? REDUCED_MOTION_SPIN_MS : SPIN_MS[index]}
                    onStopped={() => index === rolled.length - 1 && onStopped()} />
                )
            }
        </div>
    );
};

type GlobalEventRollProps = {
    // the games of the event, the reels are made of them
    games: RollGame[],
    rolled: RollGame[],
    onStopped: () => void
}

export { GlobalEventRoll }
