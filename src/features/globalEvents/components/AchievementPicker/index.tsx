import { ComponentType, useState } from "react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircularProgress, SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { GlobalEventAchievement, useGetSteamAchievementsQuery } from "../../globalEventsApi";
import {
    ACHIEVEMENT_PLATFORM_AVAILABLE,
    ACHIEVEMENT_PLATFORM_ICON,
    ACHIEVEMENT_PLATFORM_NAME,
    ACHIEVEMENT_PLATFORMS,
    AchievementPlatform,
    isSteamAppId,
    toEventAchievement
} from "../../achievementPlatforms";
import { AchievementChecklist } from "../AchievementChecklist";
import { XboxAchievementPicker } from "../XboxAchievementPicker";
import { PsnTrophyPicker } from "../PsnTrophyPicker";
import './styles.scss';

// the achievements of a game that mean it is passed, a tab per platform; any one of them counts, none may be chosen,
// then the passing is confirmed only by a claim checked by hand; the first tab is the first platform that can have the game
const AchievementPicker = ({ appId, gameName, value, onChange }: AchievementPickerProps) => {
    const { t } = useTranslation();
    const [platform, setPlatform] = useState(() =>
        ACHIEVEMENT_PLATFORMS.find(item => ACHIEVEMENT_PLATFORM_AVAILABLE[item](appId)) ?? ACHIEVEMENT_PLATFORMS[0]);
    // the game found on a platform stays while the tabs switch, even with no achievement chosen yet
    const [titleRefs, setTitleRefs] = useState<Partial<Record<AchievementPlatform, string | null>>>(() =>
        Object.fromEntries(ACHIEVEMENT_PLATFORMS.map(item => [item, value.titles[item]?.titleRef ?? null])));
    const chosenOf = (item: AchievementPlatform) => value.achievements.filter(achievement => achievement.platform === item);
    const Picker = ACHIEVEMENT_PICKERS[platform];

    // the achievements stay in the order of the platforms, the game on the platform goes with its achievements
    const changePlatform = (chosen: GlobalEventAchievement[], title: PlatformTitleChoice | null) => {
        const titles = { ...value.titles };
        if(title) {
            titles[platform] = title;
        } else {
            delete titles[platform];
        }
        onChange({ achievements: ACHIEVEMENT_PLATFORMS.flatMap(item => item === platform ? chosen : chosenOf(item)), titles });
    };

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
            <Picker
            key={platform}
            appId={appId}
            gameName={gameName}
            titleRef={titleRefs[platform] ?? null}
            chosen={chosenOf(platform)}
            onTitleRefChange={titleRef => setTitleRefs(prev => ({ ...prev, [platform]: titleRef }))}
            onChange={changePlatform} />
        </div>
    );
};

// the catalog id of a game in Steam is its Steam app id, so Steam needs no game of its own; Steam isn't asked about a game outside it
const SteamAchievementPicker = ({ appId, chosen, onChange }: PlatformPickerProps) => {
    const { t } = useTranslation();
    const isInSteam = isSteamAppId(appId);
    const steamAchievements = useGetSteamAchievementsQuery(isInSteam ? appId : skipToken);

    if(!isInSteam) {
        return <div className="achievement-picker__message">{t("This game isn't in Steam, its achievements may be on another platform")}</div>;
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
        return <div className="achievement-picker__message">{t("This game has no achievements in Steam, they may be on another platform")}</div>;
    }

    return(
        <AchievementChecklist
        achievements={achievements}
        chosen={chosen.map(achievement => achievement.apiName)}
        onChange={apiNames => onChange(achievements
            .filter(achievement => apiNames.includes(achievement.apiName))
            .map(achievement => toEventAchievement(achievement, AchievementPlatform.Steam)), null)} />
    );
};

// the picker of the achievements of a game on each platform
const ACHIEVEMENT_PICKERS: Record<AchievementPlatform, ComponentType<PlatformPickerProps>> = {
    [AchievementPlatform.Steam]: SteamAchievementPicker,
    [AchievementPlatform.Xbox]: XboxAchievementPicker,
    [AchievementPlatform.Psn]: PsnTrophyPicker,
};

// the game on a platform where it has an id of its own (a title id in Xbox, a trophy list in PSN) the chosen achievements belong to
export type PlatformTitleChoice = {
    titleRef: string,
    name: string
}

// the chosen achievements of a game on every platform, with the game on the platforms that have one of their own
export type AchievementsChoice = {
    achievements: GlobalEventAchievement[],
    // only the platforms with chosen achievements
    titles: Partial<Record<AchievementPlatform, PlatformTitleChoice>>
}

// the achievements of a game on one platform
export type PlatformPickerProps = {
    // the catalog id of the game, its Steam app id when the game is in Steam
    appId: number,
    // the name of the catalog game, a platform without the catalog ids looks for the game by it
    gameName: string,
    // the game on the platform whose achievements are shown, null while it is looked for and on a platform without games of its own
    titleRef: string | null,
    // the chosen achievements of the platform
    chosen: GlobalEventAchievement[],
    onTitleRefChange: (titleRef: string | null) => void,
    // the game goes with the chosen achievements, it is null without them and on a platform without games of its own
    onChange: (chosen: GlobalEventAchievement[], title: PlatformTitleChoice | null) => void
}

type AchievementPickerProps = Pick<PlatformPickerProps, 'appId' | 'gameName'> & {
    value: AchievementsChoice,
    onChange: (value: AchievementsChoice) => void
}

export { AchievementPicker }
