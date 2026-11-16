import { SvgIconComponent, ThumbDown, ThumbsUpDown, ThumbUp } from "@mui/icons-material";

// the thumb of a review; a review published without one is neutral
export type ReviewVerdict = "up" | "down" | "neutral";

export const reviewVerdict = (isRecommended: boolean | null): ReviewVerdict =>
    isRecommended === null ? "neutral" : isRecommended ? "up" : "down";

export const REVIEW_VERDICT_ICON: Record<ReviewVerdict, SvgIconComponent> = {
    up: ThumbUp,
    down: ThumbDown,
    neutral: ThumbsUpDown,
};

// names are also used as translation keys
export const REVIEW_VERDICT_NAME: Record<ReviewVerdict, string> = {
    up: "Recommends",
    down: "Doesn't recommend",
    neutral: "Neutral rating",
};
