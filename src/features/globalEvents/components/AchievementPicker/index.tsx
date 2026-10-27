import { useTranslation } from "react-i18next";
import { Checkbox, CircularProgress } from "@mui/material";
import { EmojiEventsOutlined } from "@mui/icons-material";
import { GlobalEventAchievement, useGetSteamAchievementsQuery } from "../../globalEventsApi";
import { GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME } from "../../globalEventLimits";
import { useAchievementText } from "../../achievementText";
import './styles.scss';

// the Steam achievements of a game, the administrator ticks the ones that mean the game is passed;
// the chosen ones keep the order of Steam, the share of the players helps to find the rare ones;
// none of them may be chosen, then the passing is confirmed only by a claim checked by hand
const AchievementPicker = ({ appId, chosen, onChange }: AchievementPickerProps) => {
    const { t, i18n } = useTranslation();
    const achievementText = useAchievementText();
    const steamAchievements = useGetSteamAchievementsQuery(appId);

    // the data of the previous game isn't shown while another one loads
    if(!steamAchievements.currentData) {
        return(
            <div className="achievement-picker__message">
                {
                    steamAchievements.isFetching ?
                    <CircularProgress color="primary" />
                    :
                    t("Steam doesn't answer, the achievements can be chosen later")
                }
            </div>
        );
    }

    const achievements = steamAchievements.currentData.achievements;
    if(!achievements.length) {
        return <div className="achievement-picker__message">{t("This game has no achievements in Steam, its passing is confirmed by hand only")}</div>;
    }

    const chosenNames = new Set(chosen.map(achievement => achievement.apiName));
    const isFull = chosenNames.size >= GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME;
    const percentFormat = new Intl.NumberFormat(i18n.resolvedLanguage);

    const toggle = (apiName: string) => {
        const names = new Set(chosenNames);
        if(!names.delete(apiName)) {
            names.add(apiName);
        }
        onChange(achievements.filter(achievement => names.has(achievement.apiName)));
    };

    return(
        <div className="achievement-picker">
            <div className="achievement-picker__hint">
                {t("Pick the achievements that mean the game is passed, any one of them counts. Without them the passing is confirmed by hand only")}
            </div>
            <div className="achievement-picker__count">
                {t("Chosen {{count}} of {{max}}", { count: chosenNames.size, max: GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME })}
            </div>
            <div className="achievement-picker__list">
                {
                    achievements.map(achievement => {
                        const isChosen = chosenNames.has(achievement.apiName);
                        const isDisabled = !isChosen && isFull;
                        const { name, description } = achievementText(achievement);
                        return(
                            <label
                            key={achievement.apiName}
                            className={`achievement-picker__item ${isChosen ? "achievement-picker__item--chosen" : ""} ${isDisabled ? "achievement-picker__item--disabled" : ""}`}>
                                <Checkbox checked={isChosen} disabled={isDisabled} onChange={() => toggle(achievement.apiName)} />
                                {
                                    achievement.iconUrl ?
                                    <img src={achievement.iconUrl} className="achievement-picker__icon" alt="" />
                                    :
                                    <span className="achievement-picker__icon achievement-picker__icon--empty"><EmojiEventsOutlined /></span>
                                }
                                <span className="achievement-picker__text">
                                    <span className="achievement-picker__name">{name}</span>
                                    <span className="achievement-picker__description">
                                        {description || (achievement.isHidden ? t("Hidden achievement") : "")}
                                    </span>
                                </span>
                                {
                                    achievement.percent !== null &&
                                    <span className="achievement-picker__percent">
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

type AchievementPickerProps = {
    // the Steam app id, the same as the catalog id of the game
    appId: number,
    chosen: GlobalEventAchievement[],
    onChange: (chosen: GlobalEventAchievement[]) => void
}

export { AchievementPicker }
