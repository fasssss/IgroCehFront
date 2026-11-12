// mirrors ReviewLimits.MinScore / MaxScore / ScoreStep on backend
export const REVIEW_MIN_SCORE = 1;
export const REVIEW_MAX_SCORE = 10;
export const REVIEW_SCORE_STEP = 0.5;

// 10, 9.5 … 1
export const REVIEW_SCORES = Array.from(
    { length: (REVIEW_MAX_SCORE - REVIEW_MIN_SCORE) / REVIEW_SCORE_STEP + 1 },
    (_, index) => REVIEW_MAX_SCORE - index * REVIEW_SCORE_STEP
);

// the color of the layouts "Обзоры" and "Мои игры": green from 7.5, yellow from 5, red below
export type ReviewScoreTone = 'success' | 'warning' | 'error';

export const reviewScoreTone = (score: number): ReviewScoreTone =>
    score >= 7.5 ? 'success' : score >= 5 ? 'warning' : 'error';

// "8.0", always with one digit after the point
export const formatReviewScore = (score: number) => score.toFixed(1);
