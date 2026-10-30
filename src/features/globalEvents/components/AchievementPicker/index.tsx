import { useState } from "react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircularProgress, SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { GlobalEventAchievement, useGetSteamAchievementsQuery } from "../../globalEventsApi";
import {
    ACHIEVEMENT_PLATFORM_ICON,
    ACHIEVEMENT_PLATFORM_NAME,
    ACHIEVEMENT_PLATFORMS,
    AchievementPlatform,
    isSteamAppId,
    toEventAchievement
} from "../../achievementPlatforms";
import { AchievementChecklist } from "../AchievementChecklist";
import { XboxAchievementPicker, XboxTitleChoice } from "../XboxAchievementPicker";
import './styles.scss';

// the achievements of a game that mean it is passed, in Steam and in Xbox on two tabs; any one of them counts,
// none may be chosen, then the passing is confirmed only by a claim checked by hand; a game outside Steam opens on Xbox
const AchievementPicker = ({ appId, gameName, value, onChange }: AchievementPickerProps) => {
    const { t } = useTranslation();
    const [platform, setPlatform] = useState<AchievementPlatform>(isSteamAppId(appId) ? AchievementPlatform.Steam : AchievementPlatform.Xbox);
    // the game in Xbox stays found while the tabs switch, even with no achievement chosen yet
    const [xboxTitleId, setXboxTitleId] = useState(value.xboxTitle?.titleId ?? null);
    const chosenOf = (item: AchievementPlatform) => value.achievements.filter(achievement => achievement.platform === item);
    const steamChosen = chosenOf(AchievementPlatform.Steam);
    const xboxChosen = chosenOf(AchievementPlatform.Xbox);

    return(
        <div className="achievement-picker">
            <div className="achievement-picker__hint">
                {t("Pick the achievements that mean the game is passed, any one of them counts. Without them the passing is confirmed by hand only")}
            </div>
            <div className="achievement-picker__tabs" role="tablist">
                {
                    ACHIEVEMENT_PLATFORMS.map(item =>
                        <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={platform === item}
                        className={`achievement-picker__tab ${platform === item ? "achievement-picker__tab--selected" : ""}`}
                        onClick={() => setPlatform(item)}>
                            <SvgIcon className="achievement-picker__tab-icon"><SvgSelector iconName={ACHIEVEMENT_PLATFORM_ICON[item]} /></SvgIcon>
                            {ACHIEVEMENT_PLATFORM_NAME[item]} · {chosenOf(item).length}
                        </button>
                    )
                }
            </div>
            {
                platform === AchievementPlatform.Steam &&
                <SteamAchievementPicker
                appId={appId}
                chosen={steamChosen}
                onChange={chosen => onChange({ ...value, achievements: [...chosen, ...xboxChosen] })} />
            }
            {
                platform === AchievementPlatform.Xbox &&
                <XboxAchievementPicker
                gameName={gameName}
                titleId={xboxTitleId}
                chosen={xboxChosen}
                onTitleIdChange={setXboxTitleId}
                onChange={(chosen, xboxTitle) => onChange({ achievements: [...steamChosen, ...chosen], xboxTitle })} />
            }
        </div>
    );
};

// the catalog id of a game in Steam is its Steam app id, Steam isn't asked about a game outside it
const SteamAchievementPicker = ({ appId, chosen, onChange }: SteamAchievementPickerProps) => {
    const { t } = useTranslation();
    const isInSteam = isSteamAppId(appId);
    const steamAchievements = useGetSteamAchievementsQuery(isInSteam ? appId : skipToken);

    if(!isInSteam) {
        return <div className="achievement-picker__message">{t("This game isn't in Steam, its achievements may be in Xbox")}</div>;
    }

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
        return <div className="achievement-picker__message">{t("This game has no achievements in Steam, they may be in Xbox")}</div>;
    }

    return(
        <AchievementChecklist
        achievements={achievements}
        chosen={chosen.map(achievement => achievement.apiName)}
        onChange={apiNames => onChange(achievements
            .filter(achievement => apiNames.includes(achievement.apiName))
            .map(achievement => toEventAchievement(achievement, AchievementPlatform.Steam)))} />
    );
};

// the chosen achievements of a game on both platforms, the Xbox ones with their game in Xbox
export type AchievementsChoice = {
    achievements: GlobalEventAchievement[],
    // null without Xbox achievements
    xboxTitle: XboxTitleChoice | null
}

type AchievementPickerProps = {
    // the catalog id of the game, its Steam app id when the game is in Steam
    appId: number,
    // the name of the catalog game, the game in Xbox is looked for by it
    gameName: string,
    value: AchievementsChoice,
    onChange: (value: AchievementsChoice) => void
}

type SteamAchievementPickerProps = {
    appId: number,
    chosen: GlobalEventAchievement[],
    onChange: (chosen: GlobalEventAchievement[]) => void
}

export { AchievementPicker }
