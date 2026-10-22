import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GroupsOutlined, LockOutlined, PeopleOutlined, PublicOutlined, ThumbDown, ThumbUp } from "@mui/icons-material";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useGetPlayerReviewsQuery } from "../../reviewsApi";
import { REVIEW_VISIBILITY_NAME, ReviewVisibility } from "../../reviewVisibility";
import { reviewPath } from "../../reviewPath";
import './styles.scss';

// reviews the player wrote, on the profile next to the history
const VISIBILITY_ICONS = {
    [ReviewVisibility.OnlyAuthor]: LockOutlined,
    [ReviewVisibility.AuthorAndGuesser]: PeopleOutlined,
    [ReviewVisibility.Guild]: GroupsOutlined,
    [ReviewVisibility.Everyone]: PublicOutlined,
};

const VisibilityIcon = ({ visibility }: { visibility: ReviewVisibility }) => {
    const { t } = useTranslation();
    const Icon = VISIBILITY_ICONS[visibility];
    return <Icon fontSize="small" className="player-reviews__visibility" titleAccess={t(REVIEW_VISIBILITY_NAME[visibility])} />;
};

const PlayerReviews = ({ userId, guildId }: PlayerReviewsProps) => {
    const { t } = useTranslation();
    // the author sees who else sees every review
    const isOwnProfile = useCurrentUser()?.id === userId;
    const reviews = useGetPlayerReviewsQuery({ userId, guildId }, { refetchOnMountOrArgChange: true });

    if(!reviews.data) {
        return null;
    }

    if(!reviews.data.reviews.length) {
        return <div className="player-reviews__empty">{t("No reviews yet")}</div>;
    }

    return(
        <div className="player-reviews">
            {
                reviews.data.reviews.map(review =>
                    <Link key={review.eventRecordId} to={reviewPath(review.eventRecordId)} className="player-reviews__item">
                        {
                            review.game.imageUrl ?
                            <img src={resolveImageUrl(review.game.imageUrl)} className="player-reviews__cover" alt="" />
                            :
                            <div className="player-reviews__cover player-reviews__cover--empty" />
                        }
                        <div className="player-reviews__info">
                            <div className="player-reviews__title">
                                <span className="player-reviews__game">{review.game.name}</span>
                                <span
                                className={`player-reviews__verdict player-reviews__verdict--${review.isRecommended ? "up" : "down"}`}
                                title={review.isRecommended ? t("Recommends") : t("Doesn't recommend")}>
                                    {review.isRecommended ? <ThumbUp fontSize="small" /> : <ThumbDown fontSize="small" />}
                                </span>
                                {isOwnProfile && <VisibilityIcon visibility={review.visibility} />}
                            </div>
                            <div className="player-reviews__details">
                                {t("Game from")} {review.guesser.userName}
                            </div>
                            <div className="player-reviews__details">
                                {review.guildIconUrl && <img src={review.guildIconUrl} className="player-reviews__guild-icon" alt="" />}
                                {review.eventName}
                            </div>
                            <div className={`player-reviews__status ${review.hasReplies ? "player-reviews__status--answered" : ""}`}>
                                {review.hasReplies ? t("Answered") : t("Waiting for answers")}
                            </div>
                        </div>
                    </Link>
                )
            }
        </div>
    );
}

type PlayerReviewsProps = {
    userId: string,
    // reviews of all shared guilds when empty
    guildId?: string
}

export { PlayerReviews }
