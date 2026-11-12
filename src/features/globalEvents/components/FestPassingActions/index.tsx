import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DsButton } from "root/shared/components/DsButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useSteamSignIn } from "root/features/steam/useSteamSignIn";
import { useXboxSignIn } from "root/features/xbox/useXboxSignIn";
import { psnLinkPath } from "root/features/psn/psnPaths";
import iconConfirm from "root/assets/design/icon-confirm-passing.svg";
import iconSteam from "root/assets/design/icon-steam.svg";
import iconXbox from "root/assets/design/icon-xbox.svg";
import iconPlaystation from "root/assets/design/icon-playstation.svg";
import {
    useGetGlobalEventParticipationQuery,
    useGetGlobalEventQuery,
    useSubmitGlobalEventClaimMutation
} from "../../globalEventsApi";
import { CLAIM_PLATFORM_NAME, CLAIM_PLATFORMS, ClaimPlatform, ClaimStatus } from "../../globalEventClaims";
import { ACHIEVEMENT_PLATFORM_NAME, ACHIEVEMENT_PLATFORMS, AchievementPlatform, isLinkedOn } from "../../achievementPlatforms";
import { GLOBAL_EVENT_CLAIM_PROFILE_MAX_LENGTH } from "../../globalEventLimits";
import { usePassingCheck } from "../../usePassingCheck";
import './styles.scss';

const PLATFORM_ICON: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: iconSteam,
    [AchievementPlatform.Xbox]: iconXbox,
    [AchievementPlatform.Psn]: iconPlaystation,
};

// the actions of the ladder row of the own Igrofest game (layout 22539:3864), the same as GlobalEventPassingProof does:
// a claim with a profile where the passing is seen goes to an administrator, every platform with achievements of the game
// checks them by itself (an unlinked one is linked first); the answers go to a line under the actions
const FestPassingActions = ({ globalEventId, onPassed }: FestPassingActionsProps) => {
    const { t, i18n } = useTranslation();
    const user = useCurrentUser();
    const globalEvent = useGetGlobalEventQuery(globalEventId).data?.globalEvent;
    const participation = useGetGlobalEventParticipationQuery(globalEventId, { refetchOnMountOrArgChange: true }).data?.participation;
    const [submitClaim, submitResult] = useSubmitGlobalEventClaimMutation();
    const [claimPlatform, setClaimPlatform] = useState<ClaimPlatform>(ClaimPlatform.Steam);
    const [profile, setProfile] = useState("");
    const [claimError, setClaimError] = useState<string | null>(null);
    const [checkTexts, setCheckTexts] = useState<Partial<Record<AchievementPlatform, string | null>>>({});
    const setCheckText = useCallback((platform: AchievementPlatform, text: string | null) =>
        setCheckTexts(texts => texts[platform] === text ? texts : { ...texts, [platform]: text }), []);

    // a passed game leaves the current ones of the ladder
    const passedAt = participation?.passedAt;
    useEffect(() => {
        if(passedAt) onPassed();
    }, [passedAt, onPassed]);

    const game = globalEvent?.games.find(item => item.appId === participation?.pickedAppId);
    if(!participation || !game || participation.passedAt) {
        return null;
    }

    const claim = participation.claim;
    if(claim?.status === ClaimStatus.Pending) {
        return(
            <div className="fest-passing">
                <p className="fest-passing__message">
                    {t("The claim is under review: {{platform}} · {{profile}}, sent on {{date}}", {
                        platform: CLAIM_PLATFORM_NAME[claim.platform],
                        profile: claim.profile,
                        date: new Date(claim.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })
                    })}
                </p>
            </div>
        );
    }

    const sendClaim = async () => {
        setClaimError(null);
        try {
            await submitClaim({ globalEventId, platform: claimPlatform, profile: profile.trim() }).unwrap();
            setProfile("");
        } catch {
            setClaimError(t("Something went wrong, try again"));
        }
    };

    // a platform checks only its own achievements of the game
    const checkPlatforms = ACHIEVEMENT_PLATFORMS.filter(platform => game.achievements.some(achievement => achievement.platform === platform));
    const messages = [
        claim?.status === ClaimStatus.Rejected &&
            (claim.comment ? t("The claim is rejected: {{comment}}", { comment: claim.comment }) : t("The claim is rejected")),
        claimError,
        ...checkPlatforms.map(platform => checkTexts[platform]),
    ].filter((text): text is string => !!text);

    return(
        <div className="fest-passing">
            <div className="fest-passing__row">
                <div className="fest-passing__claim">
                    <div className="fest-passing__field">
                        <select className="fest-passing__platform" value={claimPlatform} aria-label={t('fest.claimPlatform')}
                            onChange={e => setClaimPlatform(Number(e.target.value) as ClaimPlatform)}
                        >
                            {CLAIM_PLATFORMS.map(item => <option key={item} value={item}>{CLAIM_PLATFORM_NAME[item]}</option>)}
                        </select>
                        <input className="fest-passing__profile" value={profile} maxLength={GLOBAL_EVENT_CLAIM_PROFILE_MAX_LENGTH}
                            placeholder={t('fest.profilePlaceholder')} aria-label={t('fest.profilePlaceholder')}
                            onChange={e => setProfile(e.target.value)}
                        />
                        <span className="fest-passing__hint" tabIndex={0} role="img"
                            title={t("Give a profile on PSN, Xbox Live or Steam where the passing is seen, an administrator checks it")}
                            aria-label={t("Give a profile on PSN, Xbox Live or Steam where the passing is seen, an administrator checks it")}
                        >
                            ?
                        </span>
                    </div>
                    <DsButton size="large" uppercase icon={<img src={iconConfirm} alt="" />}
                        disabled={!profile.trim() || submitResult.isLoading}
                        onClick={sendClaim}
                    >
                        {t('fest.confirm')}
                    </DsButton>
                </div>
                {
                    checkPlatforms.length > 0 &&
                    <>
                        <span className="fest-passing__separator" aria-hidden>|</span>
                        <div className="fest-passing__checks">
                            {
                                checkPlatforms.map(platform =>
                                    <FestCheckButton key={platform}
                                        globalEventId={globalEventId}
                                        platform={platform}
                                        isLinked={!!user && isLinkedOn(user, platform)}
                                        checkableAt={participation.passingChecks.find(item => item.platform === platform)?.checkableAt ?? null}
                                        onText={setCheckText}
                                    />
                                )
                            }
                        </div>
                    </>
                }
            </div>
            {messages.length > 0 && <ul className="fest-passing__messages">{messages.map(text => <li key={text}>{text}</li>)}</ul>}
        </div>
    );
};

// the automatic check on one platform, or its sign-in while the account isn't linked
const FestCheckButton = ({ globalEventId, platform, isLinked, checkableAt, onText }: FestCheckButtonProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const passing = usePassingCheck(globalEventId, platform, checkableAt);
    const steamSignIn = useSteamSignIn();
    const xboxSignIn = useXboxSignIn();
    const name = ACHIEVEMENT_PLATFORM_NAME[platform];
    const signIn = platform === AchievementPlatform.Steam ? steamSignIn : platform === AchievementPlatform.Xbox ? xboxSignIn : null;
    const linkFailed = !isLinked && signIn?.isFailed;

    const text = linkFailed ? t("Couldn't open {{platform}}, try again", { platform: name }) : passing.checkText ?? passing.waitText;
    useEffect(() => onText(platform, text), [platform, text, onText]);

    const link = () => signIn ? signIn.signIn() : navigate(psnLinkPath(location.pathname + location.search));

    return(
        <DsButton size="large" icon={<img src={PLATFORM_ICON[platform]} alt="" />}
            title={isLinked ?
                t("Check in {{platform}}", { platform: name }) :
                t("Link {{platform}}, and the achievements of the game prove its passing by themselves", { platform: name })}
            disabled={isLinked ? passing.isChecking || passing.isWaiting : !!signIn?.isLeaving}
            onClick={isLinked ? passing.check : link}
        >
            {name}
        </DsButton>
    );
};

type FestPassingActionsProps = {
    globalEventId: string,
    // the ladder fetches its games again
    onPassed: () => void
}

type FestCheckButtonProps = {
    globalEventId: string,
    platform: AchievementPlatform,
    isLinked: boolean,
    // from then on the next check is allowed, null before the first check
    checkableAt: string | null,
    onText: (platform: AchievementPlatform, text: string | null) => void
}

export { FestPassingActions }
