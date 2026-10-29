import { useTranslation } from "react-i18next";
import { Checkbox } from "@mui/material";
import { EmojiEventsOutlined } from "@mui/icons-material";
import { PlatformAchievement } from "../../globalEventsApi";
import { GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME } from "../../globalEventLimits";
import { useAchievementText } from "../../achievementText";
import './styles.scss';

// the achievements of a game on one platform, the administrator ticks the ones that mean the game is passed;
// the chosen ones keep the order of the platform, the share of the players helps to find the rare ones
const AchievementChecklist = ({ achievements, chosen, onChange }: AchievementChecklistProps) => {
    const { t, i18n } = useTranslation();
    const achievementText = useAchievementText();
    const chosenNames = new Set(chosen);
    const isFull = chosenNames.size >= GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME;
    const percentFormat = new Intl.NumberFormat(i18n.resolvedLanguage);

    const toggle = (apiName: string) => {
        const names = new Set(chosenNames);
        if(!names.delete(apiName)) {
            names.add(apiName);
        }
        onChange(achievements.filter(achievement => names.has(achievement.apiName)).map(achievement => achievement.apiName));
    };

    return(
        <div className="achievement-checklist">
            <div className="achievement-checklist__count">
                {t("Chosen {{count}} of {{max}}", { count: chosenNames.size, max: GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME })}
            </div>
            <div className="achievement-checklist__list">
                {
                    achievements.map(achievement => {
                        const isChosen = chosenNames.has(achievement.apiName);
                        const isDisabled = !isChosen && isFull;
                        const { name, description } = achievementText(achievement);
                        return(
                            <label
                            key={achievement.apiName}
                            className={`achievement-checklist__item ${isChosen ? "achievement-checklist__item--chosen" : ""} ${isDisabled ? "achievement-checklist__item--disabled" : ""}`}>
                                <Checkbox checked={isChosen} disabled={isDisabled} onChange={() => toggle(achievement.apiName)} />
                                {
                                    achievement.iconUrl ?
                                    <img src={achievement.iconUrl} className="achievement-checklist__icon" alt="" />
                                    :
                                    <span className="achievement-checklist__icon achievement-checklist__icon--empty"><EmojiEventsOutlined /></span>
                                }
                                <span className="achievement-checklist__text">
                                    <span className="achievement-checklist__name">{name}</span>
                                    <span className="achievement-checklist__description">
                                        {description || (achievement.isHidden ? t("Hidden achievement") : "")}
                                    </span>
                                </span>
                                {
                                    achievement.percent !== null &&
                                    <span className="achievement-checklist__percent">
                                        {t("{{percent}}% of players", { percent: percentFormat.format(achievement.percent) })}
                                    </span>
                                }
                            </label>
                        );
                    })
                }
            </div>
        </div>
    );
};

type AchievementChecklistProps = {
    // in the order of the platform
    achievements: PlatformAchievement[],
    // the API names of the chosen ones
    chosen: string[],
    // the chosen API names in the order of the platform
    onChange: (chosen: string[]) => void
}

export { AchievementChecklist }
