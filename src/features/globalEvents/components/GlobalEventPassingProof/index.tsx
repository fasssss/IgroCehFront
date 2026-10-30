import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import {
    GlobalEvent,
    GlobalEventGame,
    GlobalEventParticipation,
    useCheckGlobalEventPassingMutation,
    useSubmitGlobalEventClaimMutation
} from "../../globalEventsApi";
import { CLAIM_PLATFORM_NAME, CLAIM_PLATFORMS, ClaimPlatform, ClaimStatus, PassingCheck } from "../../globalEventClaims";
import { ACHIEVEMENT_PLATFORM_ICON, ACHIEVEMENT_PLATFORM_NAME, ACHIEVEMENT_PLATFORMS, AchievementPlatform, isLinkedOn } from "../../achievementPlatforms";
import { GLOBAL_EVENT_CLAIM_PROFILE_MAX_LENGTH, GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES } from "../../globalEventLimits";
import { formatTimeLeft, useNow } from "../../globalEventTime";
import { PlatformSignInButton } from "../PlatformSignInButton";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// each platform hides the achievements of a player in its own way, so it is opened in its own way
const PROFILE_HIDDEN_TEXT: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: "The game details of your Steam profile are hidden: open them and check again",
    [AchievementPlatform.Xbox]: "Your achievements in Xbox are hidden: open them to everyone in the privacy settings of Xbox and check again",
};

// the player proves the passing of the picked game: each platform with achievements of the game counts a chosen one unlocked after the pick
// (each checked once in ten minutes), a claim with a profile on PSN, Xbox Live or Steam is checked by an administrator;
// one claim at a time is under review
const GlobalEventPassingProof = ({ globalEvent, game, participation }: GlobalEventPassingProofProps) => {
    const { t, i18n } = useTranslation();
    const user = useCurrentUser();
    const [submitClaim, submitResult] = useSubmitGlobalEventClaimMutation();
    const [isClaiming, setIsClaiming] = useState(false);
    const [platform, setPlatform] = useState<ClaimPlatform>(ClaimPlatform.Psn);
    const [profile, setProfile] = useState("");
    const [claimError, setClaimError] = useState<string | null>(null);
    const claim = participation.claim;
    // a platform checks only its own achievements of the game
    const hasAchievementsOn = (item: AchievementPlatform) => game.achievements.some(achievement => achievement.platform === item);
    const formatDate = (date: string) => new Date(date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' });

    const sendClaim = async () => {
        setClaimError(null);
        try {
            await submitClaim({ globalEventId: globalEvent.id, platform, profile: profile.trim() }).unwrap();
            setIsClaiming(false);
            setProfile("");
        } catch {
            setClaimError(t("Something went wrong, try again"));
        }
    };

    if(claim?.status === ClaimStatus.Pending) {
        return(
            <div className="global-event-passing">
                <div className="global-event-passing__pending">
                    {t("The claim is under review: {{platform}} · {{profile}}, sent on {{date}}", {
                        platform: CLAIM_PLATFORM_NAME[claim.platform],
                        profile: claim.profile,
                        date: formatDate(claim.createdAt)
                    })}
                </div>
            </div>
        );
    }

    return(
        <div className="global-event-passing">
            <h3 className="global-event-passing__title">{t("Prove the passing")}</h3>
            {
                !game.achievements.length &&
                <p className="global-event-passing__text">{t("The game has no achievements, its passing is proved by a claim only")}</p>
            }
            {
                ACHIEVEMENT_PLATFORMS.filter(hasAchievementsOn).map(item =>
                    <PlatformPassingCheck
                    key={item}
                    globalEventId={globalEvent.id}
                    platform={item}
                    isLinked={!!user && isLinkedOn(user, item)}
                    checkableAt={participation.passingChecks.find(passingCheck => passingCheck.platform === item)?.checkableAt ?? null} />
                )
            }
            {
                claim?.status === ClaimStatus.Rejected &&
                <div className="global-event-passing__rejected">
                    {claim.comment ? t("The claim is rejected: {{comment}}", { comment: claim.comment }) : t("The claim is rejected")}
                </div>
            }
            {
                isClaiming ?
                <div className="global-event-passing__form">
                    <div className="global-event-passing__platforms" role="radiogroup" aria-label={t("Platform")}>
                        {
                            CLAIM_PLATFORMS.map(item =>
                                <button
                                key={item}
                                type="button"
                                role="radio"
                                aria-checked={platform === item}
                                className={`global-event-passing__platform ${platform === item ? "global-event-passing__platform--selected" : ""}`}
                                onClick={() => setPlatform(item)}>
                                    {CLAIM_PLATFORM_NAME[item]}
                                </button>
                            )
                        }
                    </div>
                    <input
                    className="global-event-passing__profile"
                    value={profile}
                    maxLength={GLOBAL_EVENT_CLAIM_PROFILE_MAX_LENGTH}
                    placeholder={t("A name or a link of the profile")}
                    onChange={e => setProfile(e.target.value)} />
                    <div className="global-event-passing__row">
                        <CommonButton color="error" onClick={() => setIsClaiming(false)}>{t("Cancel")}</CommonButton>
                        <CommonButton color="success" disabled={!profile.trim() || submitResult.isLoading} onClick={sendClaim}>
                            {t("Send the claim")}
                        </CommonButton>
                    </div>
                    {claimError && <div className="global-event-passing__error">{claimError}</div>}
                </div>
                :
                <div className="global-event-passing__row">
                    <CommonButton onClick={() => setIsClaiming(true)}>
                        {claim?.status === ClaimStatus.Rejected ? t("Send a new claim") : t("Send a claim")}
                    </CommonButton>
                    <span className="global-event-passing__text">
                        {t("Give a profile on PSN, Xbox Live or Steam where the passing is seen, an administrator checks it")}
                    </span>
                </div>
            }
        </div>
    );
};

// the automatic check on one platform: the button with the answer of the last check and the wait until the next one,
// or the sign-in that links the platform first
const PlatformPassingCheck = ({ globalEventId, platform, isLinked, checkableAt }: PlatformPassingCheckProps) => {
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
            // a passed game turns the page into its result, so only the misses are told here
            const { passingCheck } = await checkPassing({ globalEventId, platform }).unwrap();
            setCheckText(
                passingCheck === PassingCheck.NotPassed
                    ? t("{{platform}} doesn't see any of the achievements of the game yet. Unlock one of them and check again", { platform: name })
                : passingCheck === PassingCheck.UnlockedBeforePick ? t("The achievement was unlocked before you picked the game, it doesn't count")
                : passingCheck === PassingCheck.ProfileHidden ? t(PROFILE_HIDDEN_TEXT[platform])
                : null
            );
        } catch(error) {
            // the participation is fetched again after a failure, so a check made too early shows the wait below
            const status = errorStatus(error);
            setCheckText(status === 429 ? null
                : status === 503 ? t("{{platform}} doesn't answer, try later", { platform: name })
                : t("Something went wrong, try again"));
        }
    };

    if(!isLinked) {
        return(
            <div className="global-event-passing__row">
                <PlatformSignInButton platform={platform} />
                <span className="global-event-passing__text">
                    {t("Link {{platform}}, and the achievements of the game prove its passing by themselves", { platform: name })}
                </span>
            </div>
        );
    }

    return(
        <div className="global-event-passing__row">
            <CommonButton
            startIcon={<SvgIcon><SvgSelector iconName={ACHIEVEMENT_PLATFORM_ICON[platform]} /></SvgIcon>}
            disabled={checkResult.isLoading || checkWait > 0}
            onClick={check}>
                {t("Check in {{platform}}", { platform: name })}
            </CommonButton>
            <div className="global-event-passing__notes">
                <span className="global-event-passing__text">
                    {checkText ?? t("Any one of the achievements of the game unlocked after the pick counts")}
                </span>
                {
                    checkWait > 0 &&
                    <span className="global-event-passing__text">
                        {t("{{platform}} is checked once in {{minutes}} minutes. The next check in {{left}}", {
                            platform: name,
                            minutes: GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES,
                            left: formatTimeLeft(checkWait, t)
                        })}
                    </span>
                }
            </div>
        </div>
    );
};

type GlobalEventPassingProofProps = {
    globalEvent: GlobalEvent,
    // the picked game
    game: GlobalEventGame,
    participation: GlobalEventParticipation
}

type PlatformPassingCheckProps = {
    globalEventId: string,
    platform: AchievementPlatform,
    // the player has linked the account on the platform
    isLinked: boolean,
    // from then on the next check is allowed, null before the first check
    checkableAt: string | null
}

export { GlobalEventPassingProof }
