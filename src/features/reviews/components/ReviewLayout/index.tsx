import { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { ReviewPageObject } from "../../reviewsApi";
import { ReviewPerson } from "../ReviewPerson";
import './styles.scss';

// the cover with the verdict and the settings under it on the left, the sections on the right, as on the mockup
const ReviewLayout = ({ page, verdict, settings, children }: PropsWithChildren<ReviewLayoutProps>) => {
    const { t } = useTranslation();
    const coverUrl = resolveImageUrl(page.game.imageUrl);

    return(
        <div className="review-layout">
            <div className="review-layout__columns">
                <aside className="review-layout__aside">
                    {
                        coverUrl ?
                        <img src={coverUrl} className="review-layout__cover" alt="" />
                        :
                        <div className="review-layout__cover review-layout__cover--empty" />
                    }
                    {verdict && <div className="review-layout__verdict">{verdict}</div>}
                    {settings && <div className="review-layout__settings">{settings}</div>}
                </aside>
                <div className="review-layout__content">
                    <h1 className="review-layout__title">{t("Paired review of {{game}}", { game: page.game.name })}</h1>
                    <div className="review-layout__meta">
                        <span className="review-layout__meta-item">{t("Review by")}: <ReviewPerson player={page.author} guildId={page.guildId} /></span>
                        <span className="review-layout__meta-item">{t("Game from")}: <ReviewPerson player={page.guesser} guildId={page.guildId} /></span>
                        <Link to={`/guild/${page.guildId}/event/${page.eventId}`} className="review-layout__event-link">
                            {t("To the event")}: {page.eventName}
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

type ReviewLayoutProps = {
    page: ReviewPageObject,
    // the thumbs of the editor or the verdict of the published review
    verdict?: ReactNode,
    // who sees the review, for its author
    settings?: ReactNode
}

export { ReviewLayout }
