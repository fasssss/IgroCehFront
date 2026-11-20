import { useTranslation } from "react-i18next";
import { formatReviewScore, reviewScoreTone } from "../../reviewScore";
import './styles.scss';

// the score of a review in the color of its value, as in the layouts "Обзоры" and "Мои игры"
const ReviewScore = ({ score, size = 'large', className }: ReviewScoreProps) => {
    const { t } = useTranslation();
    return(
        <span className={`review-score review-score--${size} review-score--${reviewScoreTone(score)} ${className ?? ''}`}
            title={t("Score {{score}} of 10", { score: formatReviewScore(score) })}
        >
            {formatReviewScore(score)}
        </span>
    );
};

type ReviewScoreProps = {
    score: number,
    // large is the H2 of the layouts, small goes into a line of text
    size?: 'large' | 'small',
    className?: string
}

export { ReviewScore }
