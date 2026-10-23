import { useTranslation } from "react-i18next";
import { useGetReviewSuggestionsQuery } from "../../reviewsApi";
import { GameCarousel } from "../GameCarousel";
import { CommunityReviews } from "../CommunityReviews";
import './styles.scss';

// the games the user can review or whose reviews they can answer, and below every review they can read
const ReviewsPage = () => {
    const { t } = useTranslation();
    const suggestions = useGetReviewSuggestionsQuery(undefined, { refetchOnMountOrArgChange: true });
    const toWrite = suggestions.data?.toWrite ?? [];
    const toAnswer = suggestions.data?.toAnswer ?? [];

    return(
        <div className="reviews-page">
            {
                (toWrite.length > 0 || toAnswer.length > 0) &&
                <section className="reviews-page__suggestions">
                    {toWrite.length > 0 && <GameCarousel title={t("You can review a passed game")} items={toWrite} />}
                    {toAnswer.length > 0 && <GameCarousel title={t("You can answer the review of a guessed game")} items={toAnswer} />}
                </section>
            }
            <section className="reviews-page__community">
                <h2 className="reviews-page__title">{t("Community reviews")}</h2>
                <CommunityReviews />
            </section>
        </div>
    );
};

export { ReviewsPage }
