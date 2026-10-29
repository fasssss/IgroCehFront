import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { SteamSignInButton } from "root/features/steam/components/SteamSignInButton";
import {
    GlobalEvent,
    GlobalEventGame,
    GlobalEventParticipation,
    useCheckGlobalEventPassingMutation,
    useSubmitGlobalEventClaimMutation
} from "../../globalEventsApi";
import { CLAIM_PLATFORM_NAME, CLAIM_PLATFORMS, ClaimPlatform, ClaimStatus, PassingCheck } from "../../globalEventClaims";
import { GLOBAL_EVENT_CLAIM_PROFILE_MAX_LENGTH, GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES } from "../../globalEventLimits";
import { formatTimeLeft, useNow } from "../../globalEventTime";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// the player proves the passing of the picked game: Steam counts a chosen achievement unlocked after the pick (checked once in ten minutes),
// a claim with a profile on PSN, Xbox Live or Steam is checked by an administrator; one claim at a time is under review
const GlobalEventPassingProof = ({ globalEvent, game, participation }: GlobalEventPassingProofProps) => {
    const { t, i18n } = useTranslation();
    const user = useCurrentUser();
    const [checkPassing, checkResult] = useCheckGlobalEventPassingMutation();
    const [submitClaim, submitResult] = useSubmitGlobalEventClaimMutation();
    const [checkText, setCheckText] = useState<string | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [platform, setPlatform] = useState<ClaimPlatform>(ClaimPlatform.Psn);
    const [profile, setProfile] = useState("");
    const [claimError, setClaimError] = useState<string | null>(null);
    const claim = participation.claim;
    const steamCheckableAt = participation.steamCheckableAt ? Date.parse(participation.steamCheckableAt) : null;
    const now = useNow(steamCheckableAt !== null);
    const checkWait = steamCheckableAt === null ? 0 : steamCheckableAt - now;
    const formatDate = (date: string) => new Date(date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' });

    const check = async () => {
        setCheckText(null);
        try {
            // a passed game turns the page into its result, so only the misses are told here
            const { passingCheck } = await checkPassing({ globalEventId: globalEvent.id }).unwrap();
            setCheckText(
                passingCheck === PassingCheck.NotPassed ? t("Steam doesn't see any of the achievements of the game yet. Unlock one of them and check again")
                : passingCheck === PassingCheck.UnlockedBeforePick ? t("The achievement was unlocked before you picked the game, it doesn't count")
                : passingCheck === PassingCheck.ProfileHidden ? t("The game details of your Steam profile are hidden: open them and check again")
                : null
            );
        } catch(error) {
            // the participation is fetched again after a failure, so a check made too early shows the wait below
            const status = errorStatus(error);
            setCheckText(status === 429 ? null : status === 503 ? t("Steam doesn't answer, try later") : t("Something went wrong, try again"));
        }
    };

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
                !game.achievements.length ?
                <p className="global-event-passing__text">{t("The game has no achievements, its passing is proved by a claim only")}</p>
                : user?.steamId ?
                <div className="global-event-passing__row">
                    <CommonButton
                    startIcon={<SvgIcon><SvgSelector iconName="steam-icon" /></SvgIcon>}
                    disabled={checkResult.isLoading || checkWait > 0}
                    onClick={check}>
                        {t("Check in Steam")}
                    </CommonButton>
                    <div className="global-event-passing__notes">
                        <span className="global-event-passing__text">
                            {checkText ?? t("Any one of the achievements of the game unlocked after the pick counts")}
                        </span>
                        {
                            checkWait > 0 &&
                            <span className="global-event-passing__text">
                                {t("Steam is checked once in {{minutes}} minutes. The next check in {{left}}", {
                                    minutes: GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES,
                                    left: formatTimeLeft(checkWait, t)
                                })}
                            </span>
                        }
                    </div>
                </div>
                :
                <div className="global-event-passing__row">
                    <SteamSignInButton />
                    <span className="global-event-passing__text">{t("Link Steam, and the achievements of the game prove its passing by themselves")}</span>
                </div>
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

type GlobalEventPassingProofProps = {
    globalEvent: GlobalEvent,
    // the picked game
    game: GlobalEventGame,
    participation: GlobalEventParticipation
}

export { GlobalEventPassingProof }
