import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined, ThumbDown, ThumbUp } from "@mui/icons-material";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useGetCommunityReviewsQuery } from "../../reviewsApi";
import { reviewPath } from "../../reviewPath";
import './styles.scss';

const PAGE_SIZE = 20;

// every review the user can read, the newest first; more of them are asked for when the end of the list is reached
const CommunityReviews = () => {
    const { t } = useTranslation();
    const [count, setCount] = useState(PAGE_SIZE);
    // while more reviews load, the data of the shorter list stays on the page
    const reviews = useGetCommunityReviewsQuery(count, { refetchOnMountOrArgChange: true });
    const listEnd = useRef<HTMLDivElement>(null);
    const items = reviews.data?.reviews ?? [];
    const canLoadMore = !!reviews.data?.hasMore && !reviews.isFetching && !reviews.isError;

    useEffect(() => {
        if(!canLoadMore || !listEnd.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if(entry.isIntersecting) {
                setCount(items.length + PAGE_SIZE);
            }
        });
        observer.observe(listEnd.current);
        return () => observer.disconnect();
    }, [canLoadMore, items.length]);

    if(reviews.data && !items.length) {
        return <div className="community-reviews__empty">{t("No reviews yet")}</div>;
    }

    return(
        <>
            <div className="community-reviews">
                {
                    items.map(review =>
                        <Link key={review.eventRecordId} to={reviewPath(review.eventRecordId)} className="community-reviews__item">
                            {
                                review.game.imageUrl ?
                                <img src={resolveImageUrl(review.game.imageUrl)} className="community-reviews__cover" alt="" />
                                :
                                <div className="community-reviews__cover community-reviews__cover--empty">
                                    <ImageNotSupportedOutlined />
                                </div>
                            }
                            <div className="community-reviews__info">
                                <div className="community-reviews__game">{review.game.name}</div>
                                <div className="community-reviews__author">
                                    {
                                        review.author.avatarUrl ?
                                        <img src={review.author.avatarUrl} className="community-reviews__avatar" alt="" />
                                        :
                                        <span className="community-reviews__avatar community-reviews__avatar--empty">{review.author.userName.charAt(0)}</span>
                                    }
                                    <span className="community-reviews__author-name">{review.author.userName}</span>
                                </div>
                                <div className="community-reviews__verdict">
                                    {review.isRecommended ? t("Recommends") : t("Doesn't recommend")}
                                    <span className={`community-reviews__thumb community-reviews__thumb--${review.isRecommended ? "up" : "down"}`}>
                                        {review.isRecommended ? <ThumbUp fontSize="small" /> : <ThumbDown fontSize="small" />}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                }
            </div>
            <div ref={listEnd} className="community-reviews__loader">
                {reviews.isFetching && <CircularProgress color="primary" />}
            </div>
        </>
    );
};

export { CommunityReviews }
