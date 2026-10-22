import { useTranslation } from "react-i18next";
import { Slider } from "@mui/material";
import { GroupsOutlined, LockOutlined, PeopleOutlined, PublicOutlined } from "@mui/icons-material";
import { REVIEW_VISIBILITY_NAME, REVIEW_VISIBILITY_VALUES, ReviewVisibility } from "../../reviewVisibility";
import './styles.scss';

const ICONS = {
    [ReviewVisibility.OnlyAuthor]: LockOutlined,
    [ReviewVisibility.AuthorAndGuesser]: PeopleOutlined,
    [ReviewVisibility.Guild]: GroupsOutlined,
    [ReviewVisibility.Everyone]: PublicOutlined,
};

// the author moves it from "only me" to "everyone", the current choice is written under it
const ReviewVisibilitySlider = ({ value, onChange, onChangeCommitted }: ReviewVisibilitySliderProps) => {
    const { t } = useTranslation();
    const marks = REVIEW_VISIBILITY_VALUES.map(visibility => {
        const Icon = ICONS[visibility];
        return { value: visibility, label: <Icon fontSize="small" titleAccess={t(REVIEW_VISIBILITY_NAME[visibility])} /> };
    });

    return(
        <div className="review-visibility">
            <div className="review-visibility__title">{t("Who sees the review")}</div>
            <Slider
            className="review-visibility__slider"
            value={value}
            min={ReviewVisibility.OnlyAuthor}
            max={ReviewVisibility.Everyone}
            step={1}
            marks={marks}
            aria-label={t("Who sees the review")}
            getAriaValueText={visibility => t(REVIEW_VISIBILITY_NAME[visibility as ReviewVisibility])}
            onChange={(_event, visibility) => onChange(visibility as ReviewVisibility)}
            onChangeCommitted={(_event, visibility) => onChangeCommitted?.(visibility as ReviewVisibility)} />
            <div className="review-visibility__value">{t(REVIEW_VISIBILITY_NAME[value])}</div>
        </div>
    );
}

type ReviewVisibilitySliderProps = {
    value: ReviewVisibility,
    onChange: (visibility: ReviewVisibility) => void,
    // when the slider is released, the published review saves the choice
    onChangeCommitted?: (visibility: ReviewVisibility) => void
}

export { ReviewVisibilitySlider }
