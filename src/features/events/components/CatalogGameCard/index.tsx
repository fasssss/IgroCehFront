import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pills } from "root/shared/components/Pills";
import { PoweredBy } from "root/shared/components/PoweredBy";
import { CatalogGameObject } from "../../eventsApi";
import { toPlatformPills } from "../../platformPills";
import './styles.scss';

const getScoreLevel = (score: number | null) =>
    score === null ? 'none' : score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

// a game found in VideoGamesCritic with its scores, the page puts its own button under the scores
const CatalogGameCard = ({ game, action, footer }: CatalogGameCardProps) => {
    const { t } = useTranslation();

    return(
        <div className="catalog-game-card">
            <img src={game.coverUrl ?? undefined} className="catalog-game-card__image" />
            <div className="catalog-game-card__info">
                <div className="catalog-game-card__name-container">
                    <div className="catalog-game-card__name">{game.name}</div>
                </div>
                <Pills items={toPlatformPills(game.platforms)} />
                <div className="catalog-game-card__scores">
                    <div className="catalog-game-card__score-label">{t("Critics score")}:</div>
                    <div className={`catalog-game-card__score catalog-game-card__score--${getScoreLevel(game.criticsScore)}`}>
                        {game.criticsScore ?? "—"}
                    </div>
                    <div className="catalog-game-card__score-label">{t("Players score")}:</div>
                    <div className={`catalog-game-card__score catalog-game-card__score--${getScoreLevel(game.playersScore)}`}>
                        {game.playersScore ?? "—"}
                    </div>
                </div>
            </div>
            <PoweredBy href={game.pageUrl} className="catalog-game-card__powered-by" />
            <div className="catalog-game-card__action">
                {action}
            </div>
            {
                footer &&
                <div className="catalog-game-card__footer">{footer}</div>
            }
        </div>
    );
};

type CatalogGameCardProps = {
    game: CatalogGameObject,
    // stands under the scores, as wide as they are
    action?: ReactNode,
    // takes its own row under the card, e.g. an error
    footer?: ReactNode
}

export { CatalogGameCard }
