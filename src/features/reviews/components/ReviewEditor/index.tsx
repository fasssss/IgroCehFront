import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@mui/material";
import { Add, Close, ThumbDown, ThumbDownOutlined, ThumbUp, ThumbUpOutlined } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { ReviewPageObject, usePublishReviewMutation } from "../../reviewsApi";
import { ReviewVisibility } from "../../reviewVisibility";
import { REVIEW_MAX_SECTIONS, REVIEW_TEXT_MAX_LENGTH, REVIEW_TITLE_MAX_LENGTH } from "../../reviewLimits";
import { ReviewLayout } from "../ReviewLayout";
import { ReviewVisibilitySlider } from "../ReviewVisibilitySlider";
import './styles.scss';

type DraftSection = {
    key: number,
    title: string,
    text: string
};

// the player who passed the game writes the sections, picks a thumb and publishes everything at once
const ReviewEditor = ({ page }: ReviewEditorProps) => {
    const { t } = useTranslation();
    const [isRecommended, setIsRecommended] = useState<boolean | null>(null);
    const [visibility, setVisibility] = useState<ReviewVisibility>(ReviewVisibility.Guild);
    const [sections, setSections] = useState<DraftSection[]>([{ key: 0, title: "", text: "" }]);
    const [nextKey, setNextKey] = useState(1);
    const [isConfirmShown, setIsConfirmShown] = useState(false);
    const [publishReview, publishResult] = usePublishReviewMutation();
    const areSectionsFilled = sections.every(section => section.title.trim() && section.text.trim());
    const canPublish = isRecommended !== null && areSectionsFilled;

    const updateSection = (key: number, change: Partial<DraftSection>) =>
        setSections(current => current.map(section => section.key === key ? { ...section, ...change } : section));

    const addSection = () => {
        setSections(current => [...current, { key: nextKey, title: "", text: "" }]);
        setNextKey(key => key + 1);
    };

    const publish = async () => {
        setIsConfirmShown(false);
        try {
            // the page switches to the published review when the query refetches
            await publishReview({
                eventRecordId: page.eventRecordId,
                eventId: page.eventId,
                isRecommended: isRecommended === true,
                visibility,
                sections: sections.map(({ title, text }) => ({ title, text })),
            }).unwrap();
        } catch {
            // the error is shown under the button
        }
    };

    const thumb = (value: boolean) =>
        <button
        type="button"
        className={`review-editor__thumb review-editor__thumb--${value ? "up" : "down"} ${isRecommended === value ? "review-editor__thumb--active" : ""}`}
        aria-pressed={isRecommended === value}
        title={value ? t("I recommend") : t("I don't recommend")}
        aria-label={value ? t("I recommend") : t("I don't recommend")}
        onClick={() => setIsRecommended(value)}>
            {
                value ?
                (isRecommended === true ? <ThumbUp /> : <ThumbUpOutlined />)
                :
                (isRecommended === false ? <ThumbDown /> : <ThumbDownOutlined />)
            }
        </button>;

    return(
        <ReviewLayout
        page={page}
        verdict={<div className="review-editor__thumbs">{thumb(true)}{thumb(false)}</div>}
        settings={<ReviewVisibilitySlider value={visibility} onChange={setVisibility} />}>
            {
                sections.map(section =>
                    <div key={section.key} className="review-editor__section">
                        <div className="review-editor__section-header">
                            <input
                            className="review-editor__topic-input"
                            placeholder={t("Topic, e.g. Story")}
                            value={section.title}
                            maxLength={REVIEW_TITLE_MAX_LENGTH}
                            onChange={e => updateSection(section.key, { title: e.target.value })} />
                            {
                                sections.length > 1 &&
                                <IconButton
                                className="review-editor__remove-section"
                                aria-label={t("Remove the section")}
                                title={t("Remove the section")}
                                onClick={() => setSections(current => current.filter(item => item.key !== section.key))}>
                                    <Close />
                                </IconButton>
                            }
                        </div>
                        <textarea
                        className="review-editor__textarea"
                        placeholder={t("What do you think about it?")}
                        value={section.text}
                        maxLength={REVIEW_TEXT_MAX_LENGTH}
                        onChange={e => updateSection(section.key, { text: e.target.value })} />
                    </div>
                )
            }
            {
                sections.length < REVIEW_MAX_SECTIONS &&
                <button type="button" className="review-editor__add-section" aria-label={t("Add a section")} title={t("Add a section")} onClick={addSection}>
                    <Add fontSize="large" />
                </button>
            }
            <div className="review-editor__actions">
                {
                    isRecommended === null && areSectionsFilled &&
                    <div className="review-editor__hint">{t("Choose whether you recommend the game")}</div>
                }
                <CommonButton color="success" disabled={!canPublish || publishResult.isLoading} onClick={() => setIsConfirmShown(true)}>
                    {t("Publish")}
                </CommonButton>
                {
                    publishResult.isError &&
                    <div className="review-editor__error">{t("Couldn't publish, try again")}</div>
                }
            </div>
            {
                isConfirmShown &&
                <CommonModal
                name={t("Publish the review?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={publish}
                onClose={() => setIsConfirmShown(false)}>
                    {t("After publishing the review can't be changed.")}
                </CommonModal>
            }
        </ReviewLayout>
    );
};

type ReviewEditorProps = {
    // a passed game without a review yet
    page: ReviewPageObject
}

export { ReviewEditor }
