import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCheckGlobalEventPassingMutation } from "./globalEventsApi";
import { PassingCheck } from "./globalEventClaims";
import { ACHIEVEMENT_PLATFORM_NAME, AchievementPlatform } from "./achievementPlatforms";
import { GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES } from "./globalEventLimits";
import { formatTimeLeft, useNow } from "./globalEventTime";

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// each platform hides the achievements of a player in its own way, so it is opened in its own way
const PROFILE_HIDDEN_TEXT: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: "The game details of your Steam profile are hidden: open them and check again",
    [AchievementPlatform.Xbox]: "Your achievements in Xbox are hidden: open them to everyone in the privacy settings of Xbox and check again",
    [AchievementPlatform.Psn]: "Your trophies in PlayStation are hidden: open them to everyone in the privacy settings of PlayStation and check again",
};

// the API answers 503 for a platform that is down and for a limit of requests; PSN shares one limit for the whole site, so it may be just busy
const UNAVAILABLE_TEXT: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: "{{platform}} doesn't answer, try later",
    [AchievementPlatform.Xbox]: "{{platform}} doesn't answer, try later",
    [AchievementPlatform.Psn]: "PSN doesn't answer or is busy, try later",
};

// the automatic check of the passing of the picked game on one platform: the answer of the last check
// and the wait until the next one (a platform is checked once in ten minutes); a passed game updates the participation itself,
// so only the misses come as a text
export const usePassingCheck = (globalEventId: string, platform: AchievementPlatform, checkableAt: string | null) => {
    const { t } = useTranslation();
    const [checkPassing, checkResult] = useCheckGlobalEventPassingMutation();
    const [checkText, setCheckText] = useState<string | null>(null);
    const checkableTime = checkableAt ? Date.parse(checkableAt) : null;
    const now = useNow(checkableTime !== null);
    const checkWait = checkableTime === null ? 0 : checkableTime - now;
    const name = ACHIEVEMENT_PLATFORM_NAME[platform];

    const check = async () => {
        setCheckText(null);
        try {
            const { passingCheck } = await checkPassing({ globalEventId, platform }).unwrap();
            setCheckText(
                passingCheck === PassingCheck.NotPassed
                    ? t("{{platform}} doesn't see any of the achievements of the game yet. Unlock one of them and check again", { platform: name })
                : passingCheck === PassingCheck.UnlockedBeforePick ? t("The achievement was unlocked before you picked the game, it doesn't count")
                : passingCheck === PassingCheck.ProfileHidden ? t(PROFILE_HIDDEN_TEXT[platform])
                : null
            );
        } catch(error) {
            // the participation is fetched again after a failure, so a check made too early shows the wait
            const status = errorStatus(error);
            setCheckText(status === 429 ? null
                : status === 503 ? t(UNAVAILABLE_TEXT[platform], { platform: name })
                : t("Something went wrong, try again"));
        }
    };

    const waitText = checkWait > 0 ?
        t("{{platform}} is checked once in {{minutes}} minutes. The next check in {{left}}", {
            platform: name,
            minutes: GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES,
            left: formatTimeLeft(checkWait, t)
        })
        : null;

    return { check, isChecking: checkResult.isLoading, isWaiting: checkWait > 0, checkText, waitText };
};
