import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useGetReviewQuery } from "../../reviewsApi";
import { ReviewEditor } from "../ReviewEditor";
import { ReviewLayout } from "../ReviewLayout";
import { PublishedReview } from "../PublishedReview";
import './styles.scss';

// a paired review of a passed game: written by the player who passed it, answered by the one who guessed it
const ReviewPage = () => {
    const { t } = useTranslation();
    const { eventRecordId = "" } = useParams();
    const currentUser = useCurrentUser();
    const page = useGetReviewQuery(eventRecordId, { refetchOnMountOrArgChange: true });

    if(page.isError) {
        return(
            <div className="review-page__message">
                {t("The review is not found")}
                <Link to="/">{t("To the main page")}</Link>
            </div>
        );
    }

    if(!page.data || !currentUser) {
        return(
            <div className="review-page__message">
                <CircularProgress color="primary" />
            </div>
        );
    }

    const { review, author, guesser, isPassed } = page.data;
    if(!review) {
        return currentUser.id === author.id && isPassed ?
            <ReviewEditor page={page.data} />
            :
            <ReviewLayout page={page.data}>
                <div className="review-page__waiting">{t("The review isn't written yet")}</div>
            </ReviewLayout>;
    }

    // a review kept to its author isn't returned to the one who guessed the game, so whoever sees it may answer it
    return(
        <PublishedReview
        page={page.data}
        isAuthor={currentUser.id === author.id}
        canReply={currentUser.id === guesser.id && !review.repliesPublishedAt} />
    );
};

export { ReviewPage }
