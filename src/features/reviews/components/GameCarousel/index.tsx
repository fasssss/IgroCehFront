import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ImageNotSupportedOutlined } from "@mui/icons-material";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { ReviewSuggestion } from "../../reviewsApi";
import { reviewPath } from "../../reviewPath";
import './styles.scss';

// a row of games scrolled by the arrows or by swiping, every game leads to its review
const GameCarousel = ({ title, items }: GameCarouselProps) => {
    const { t } = useTranslation();
    const track = useRef<HTMLDivElement>(null);
    const [canScrollBack, setCanScrollBack] = useState(false);
    const [canScrollForward, setCanScrollForward] = useState(false);

    const updateArrows = useCallback(() => {
        const element = track.current;
        if(!element) return;
        setCanScrollBack(element.scrollLeft > 0);
        // a scaled page leaves the end of the scroll a fraction of a pixel short
        setCanScrollForward(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
    }, []);

    useEffect(() => {
        if(!track.current) return;
        updateArrows();
        const observer = new ResizeObserver(updateArrows);
        observer.observe(track.current);
        return () => observer.disconnect();
    }, [updateArrows, items.length]);

    const scroll = (direction: number) => {
        const element = track.current;
        element?.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: 'smooth' });
    };

    return(
        <div className="game-carousel">
            <h3 className="game-carousel__title">{title}</h3>
            <div className="game-carousel__body">
                <div ref={track} className="game-carousel__track" onScroll={updateArrows}>
                    {
                        items.map(item =>
                            <Link key={item.eventRecordId} to={reviewPath(item.eventRecordId)} className="game-carousel__item" title={item.eventName}>
                                {
                                    item.game.imageUrl ?
                                    <img src={resolveImageUrl(item.game.imageUrl)} className="game-carousel__cover" alt="" />
                                    :
                                    <div className="game-carousel__cover game-carousel__cover--empty">
                                        <ImageNotSupportedOutlined />
                                    </div>
                                }
                                <span className="game-carousel__name">{item.game.name}</span>
                            </Link>
                        )
                    }
                </div>
                {/* a row that fits on the screen needs no arrows */}
                {
                    (canScrollBack || canScrollForward) &&
                    <div className="game-carousel__arrows">
                        <button
                        type="button"
                        className="game-carousel__arrow"
                        disabled={!canScrollBack}
                        onClick={() => scroll(-1)}
                        aria-label={t("Previous games")}>
                            <ChevronLeft fontSize="large" />
                        </button>
                        <button
                        type="button"
                        className="game-carousel__arrow"
                        disabled={!canScrollForward}
                        onClick={() => scroll(1)}
                        aria-label={t("Next games")}>
                            <ChevronRight fontSize="large" />
                        </button>
                    </div>
                }
            </div>
        </div>
    );
};

type GameCarouselProps = {
    title: string,
    items: ReviewSuggestion[]
}

export { GameCarousel }
