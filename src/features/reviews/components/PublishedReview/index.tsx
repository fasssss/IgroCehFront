import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ThumbDown, ThumbUp } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { ReviewPageObject, usePublishReviewRepliesMutation, useSetReviewVisibilityMutation } from "../../reviewsApi";
import { ReviewVisibility } from "../../reviewVisibility";
import { REVIEW_REPLY_MAX_LENGTH } from "../../reviewLimits";
import { ReviewLayout } from "../ReviewLayout";
import { ReviewPerson } from "../ReviewPerson";
import { ReviewVisibilitySlider } from "../ReviewVisibilitySlider";
import './styles.scss';

// the published review; the one who guessed the game answers the sections until the answers are published
const PublishedReview = ({ page, canReply, isAuthor }: PublishedReviewProps) => {
    const { t } = useTranslation();
    const [replies, setReplies] = useState<Record<string, string>>({});
    const [isConfirmShown, setIsConfirmShown] = useState(false);
    const [publishReplies, publishResult] = usePublishReviewRepliesMutation();
    const review = page.review!;
    const canPublish = Object.values(replies).some(reply => reply.trim());
    // the slider moves at once, the choice is saved when it is released
    const [visibility, setVisibility] = useState<ReviewVisibility>(review.visibility);
    const [setReviewVisibility, setVisibilityResult] = useSetReviewVisibilityMutation();

    const saveVisibility = async (value: ReviewVisibility) => {
        if(value === review.visibility) {
            return;
        }

        try {
            await setReviewVisibility({ eventRecordId: page.eventRecordId, visibility: value }).unwrap();
        } catch {
            setVisibility(review.visibility);
        }
    };

    const publish = async () => {
        setIsConfirmShown(false);
        try {
            await publishReplies({
                eventRecordId: page.eventRecordId,
                replies: review.sections.map(section => ({ sectionId: section.id, text: replies[section.id] ?? "" })),
            }).unwrap();
        } catch {
            // the error is shown under the button
        }
    };

    const verdict =
        <div className={`published-review__verdict published-review__verdict--${review.isRecommended ? "up" : "down"}`}>
            {review.isRecommended ? <ThumbUp /> : <ThumbDown />}
            {review.isRecommended ? t("Recommends") : t("Doesn't recommend")}
        </div>;

    const settings = isAuthor &&
        <>
            <ReviewVisibilitySlider value={visibility} onChange={setVisibility} onChangeCommitted={saveVisibility} />
            {
                setVisibilityResult.isError &&
                <div className="published-review__error">{t("Couldn't change, try again")}</div>
            }
        </>;

    return(
        <ReviewLayout page={page} verdict={verdict} settings={settings}>
            {
                review.sections.map(section =>
                    <div key={section.id} className="published-review__section">
                        <h2 className="published-review__section-title">{section.title}</h2>
                        <div className="published-review__section-text">{section.text}</div>
                        {
                            canReply ?
                            <textarea
                            className="published-review__reply-input"
                            placeholder={t("Your answer to this section")}
                            value={replies[section.id] ?? ""}
                            maxLength={REVIEW_REPLY_MAX_LENGTH}
                            onChange={e => setReplies(current => ({ ...current, [section.id]: e.target.value }))} />
                            :
                            section.reply &&
                            <div className="published-review__reply">
                                <ReviewPerson player={page.guesser} guildId={page.guildId} />
                                <div className="published-review__reply-text">{section.reply}</div>
                            </div>
                        }
                    </div>
                )
            }
            {
                canReply ?
                <div className="published-review__actions">
                    <CommonButton color="success" disabled={!canPublish || publishResult.isLoading} onClick={() => setIsConfirmShown(true)}>
                        {t("Publish answers")}
                    </CommonButton>
                    {
                        publishResult.isError &&
                        <div className="published-review__error">{t("Couldn't publish, try again")}</div>
                    }
                </div>
                :
                !review.repliesPublishedAt &&
                <div className="published-review__waiting">{t("No answers from {{player}} yet", { player: page.guesser.userName })}</div>
            }
            {
                isConfirmShown &&
                <CommonModal
                name={t("Publish the answers?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={publish}
                onClose={() => setIsConfirmShown(false)}>
                    {t("After publishing the answers can't be changed.")}
                </CommonModal>
            }
        </ReviewLayout>
    );
};

type PublishedReviewProps = {
    // a page with the published review
    page: ReviewPageObject,
    // the one who guessed the game, until the answers are published
    canReply: boolean,
    isAuthor: boolean
}

export { PublishedReview }
