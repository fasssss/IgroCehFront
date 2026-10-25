import { useEffect, useMemo, useRef, useState } from "react";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import type { GameObject } from "../../eventsApi";
import './styles.scss';

type RouletteGame = Pick<GameObject, 'id' | 'name' | 'imageUrl'>;

// the strip is long enough to run for a while, the dropped game stands near its end
const STRIP_LENGTH = 40;
const DROPPED_INDEX = 34;
const SPIN_MS = 5000;
const REDUCED_MOTION_SPIN_MS = 300;

// a strip of covers runs under the mark and stops on the game the server has picked
const NewcomerRoulette = ({ games, dropped, onStopped }: NewcomerRouletteProps) => {
    const viewport = useRef<HTMLDivElement>(null);
    const item = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
    const isReducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
    // the other covers come in a random order, so every spin looks different; the strip is made once, updates of the page don't shuffle it
    const [strip] = useState(() => Array.from({ length: STRIP_LENGTH }, (_, index) =>
        index === DROPPED_INDEX ? dropped : games[Math.floor(Math.random() * games.length)]));

    useEffect(() => {
        if(!viewport.current || !item.current) return;
        const itemWidth = item.current.offsetWidth;
        const step = itemWidth + parseFloat(getComputedStyle(item.current.parentElement!).columnGap || '0');
        // the mark stops somewhere inside the cover, not always at its middle
        const insideCover = (Math.random() - 0.5) * itemWidth * 0.6;
        const target = DROPPED_INDEX * step + itemWidth / 2 + insideCover - viewport.current.clientWidth / 2;
        // the strip starts from its place, the move is animated on the next frame
        const frame = requestAnimationFrame(() => setOffset(target));
        return () => cancelAnimationFrame(frame);
    }, []);

    return(
        <div ref={viewport} className="newcomer-roulette">
            <div className="newcomer-roulette__mark" />
            <div
            className="newcomer-roulette__strip"
            style={{
                transform: `translateX(${-offset}px)`,
                transitionDuration: `${isReducedMotion ? REDUCED_MOTION_SPIN_MS : SPIN_MS}ms`,
            }}
            onTransitionEnd={onStopped}>
                {
                    strip.map((game, index) =>
                        <div key={index} ref={index === 0 ? item : undefined} className="newcomer-roulette__item">
                            {
                                game.imageUrl ?
                                <img src={resolveImageUrl(game.imageUrl)} className="newcomer-roulette__cover" alt="" />
                                :
                                <div className="newcomer-roulette__cover newcomer-roulette__cover--empty">
                                    <ImageNotSupportedOutlined />
                                </div>
                            }
                            <div className="newcomer-roulette__name">{game.name}</div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

type NewcomerRouletteProps = {
    // the games that could drop, the strip is made of them
    games: RouletteGame[],
    dropped: RouletteGame,
    onStopped: () => void
}

export { NewcomerRoulette }
