import { PropsWithChildren, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { EmojiEventsOutlined, ImageNotSupportedOutlined } from "@mui/icons-material";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { GlobalEventAchievement } from "../../globalEventsApi";
import { ACHIEVEMENT_PLATFORM_ICON, ACHIEVEMENT_PLATFORM_NAME } from "../../achievementPlatforms";
import { useAchievementText } from "../../achievementText";
import './styles.scss';

// a game of a global event with the achievements in Steam and in Xbox that mean it is passed, each marked with its platform;
// children take a row under the card
const GlobalEventGameCard = ({ name, imageUrl, achievements, actions, children }: PropsWithChildren<GlobalEventGameCardProps>) => {
    const { t } = useTranslation();
    const achievementText = useAchievementText();

    return(
        <div className="global-event-game-card">
            {
                imageUrl ?
                <img src={resolveImageUrl(imageUrl)} className="global-event-game-card__cover" alt="" />
                :
                <div className="global-event-game-card__cover global-event-game-card__cover--empty">
                    <ImageNotSupportedOutlined />
                </div>
            }
            <div className="global-event-game-card__body">
                <div className="global-event-game-card__name">{name}</div>
                {
                    !achievements.length &&
                    <div className="global-event-game-card__no-achievements">{t("No achievements, the passing is confirmed by hand only")}</div>
                }
                <div className="global-event-game-card__achievements">
                    {
                        achievements.map(achievement => {
                            const { name, description } = achievementText(achievement);
                            return(
                                <div key={`${achievement.platform}-${achievement.apiName}`} className="global-event-game-card__achievement">
                                    {
                                        achievement.iconUrl ?
                                        <img src={achievement.iconUrl} className="global-event-game-card__icon" alt="" />
                                        :
                                        <span className="global-event-game-card__icon global-event-game-card__icon--empty"><EmojiEventsOutlined /></span>
                                    }
                                    <span className="global-event-game-card__achievement-text">
                                        <span className="global-event-game-card__achievement-name">
                                            <span className="global-event-game-card__platform" title={ACHIEVEMENT_PLATFORM_NAME[achievement.platform]}>
                                                <SvgIcon className="global-event-game-card__platform-icon">
                                                    <SvgSelector iconName={ACHIEVEMENT_PLATFORM_ICON[achievement.platform]} />
                                                </SvgIcon>
                                            </span>
                                            {name}
                                        </span>
                                        {
                                            description &&
                                            <span className="global-event-game-card__achievement-description">{description}</span>
                                        }
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            {
                actions &&
                <div className="global-event-game-card__actions">{actions}</div>
            }
            {
                children &&
                <div className="global-event-game-card__extra">{children}</div>
            }
        </div>
    );
};

type GlobalEventGameCardProps = {
    name: string,
    // a catalog cover or an image uploaded to the API
    imageUrl: string | null,
    achievements: GlobalEventAchievement[],
    actions?: ReactNode
}

export { GlobalEventGameCard }
