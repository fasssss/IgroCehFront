import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { ReviewPageObject, usePublishReviewMutation } from "../../reviewsApi";
import { ReviewVisibility } from "../../reviewVisibility";
import { REVIEW_MAX_SECTIONS, REVIEW_TEXT_MAX_LENGTH, REVIEW_TITLE_MAX_LENGTH } from "../../reviewLimits";
import { formatReviewScore, REVIEW_SCORES } from "../../reviewScore";
import { ReviewScore } from "../ReviewScore";
import { ReviewLayout } from "../ReviewLayout";
import { ReviewVisibilitySlider } from "../ReviewVisibilitySlider";
import './styles.scss';

type DraftSection = {
    key: number,
    title: string,
    text: string
};

// the player who passed the game writes the sections, scores the game and publishes everything at once
const ReviewEditor = ({ page }: ReviewEditorProps) => {
    const { t } = useTranslation();
    const [score, setScore] = useState<number | null>(null);
    const [visibility, setVisibility] = useState<ReviewVisibility>(ReviewVisibility.Guild);
    const [sections, setSections] = useState<DraftSection[]>([{ key: 0, title: "", text: "" }]);
    const [nextKey, setNextKey] = useState(1);
    const [isConfirmShown, setIsConfirmShown] = useState(false);
    const [publishReview, publishResult] = usePublishReviewMutation();
    const areSectionsFilled = sections.every(section => section.title.trim() && section.text.trim());
    const canPublish = score !== null && areSectionsFilled;

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
                score: score ?? 0,
                visibility,
                sections: sections.map(({ title, text }) => ({ title, text })),
            }).unwrap();
        } catch {
            // the error is shown under the button
        }
    };

    // a score from 1 to 10 in steps of 0.5, shown in its color once it is chosen
    const scorePicker =
        <label className="review-editor__score">
            <select className="review-editor__score-select" value={score ?? ""} aria-label={t("Score the game")}
                onChange={e => setScore(e.target.value ? Number(e.target.value) : null)}
            >
                <option value="">{t("Score the game")}</option>
                {REVIEW_SCORES.map(value => <option key={value} value={value}>{formatReviewScore(value)}</option>)}
            </select>
            {score !== null && <ReviewScore score={score} />}
        </label>;

    return(
        <ReviewLayout
        page={page}
        verdict={scorePicker}
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
                    score === null && areSectionsFilled &&
                    <div className="review-editor__hint">{t("Score the game")}</div>
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
