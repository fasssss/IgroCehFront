import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircularProgress } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import type { UserShortObject } from "root/features/events/eventsApi";
import {
    GlobalEventClaim,
    useDecideGlobalEventClaimMutation,
    useGetGlobalEventClaimsQuery,
    useGetGlobalEventQuery
} from "../../globalEventsApi";
import { CLAIM_PLATFORM_NAME, ClaimStatus, claimProfileUrl } from "../../globalEventClaims";
import { GLOBAL_EVENT_CLAIM_COMMENT_MAX_LENGTH } from "../../globalEventLimits";
import { globalEventPath } from "../../globalEventPath";
import { GlobalEventGameCard } from "../GlobalEventGameCard";
import './styles.scss';

const Player = ({ player }: { player: UserShortObject }) =>
    <span className="global-event-claims__player">
        {
            player.avatarUrl ?
            <img src={player.avatarUrl} className="global-event-claims__avatar" alt="" />
            :
            <span className="global-event-claims__avatar global-event-claims__avatar--empty">{player.userName.charAt(0)}</span>
        }
        {player.userName}
    </span>;

// the administrators of the site check the claims that the picked games of a global event are passed:
// the ones under review first, the oldest on top, then the decided ones
const GlobalEventClaimsPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { globalEventId = "" } = useParams();
    const user = useCurrentUser();
    const isAdmin = !!user?.isAppAdmin;
    const globalEventQuery = useGetGlobalEventQuery(isAdmin ? globalEventId : skipToken);
    const claimsQuery = useGetGlobalEventClaimsQuery(isAdmin ? globalEventId : skipToken, { refetchOnMountOrArgChange: true });
    const [decide, decideResult] = useDecideGlobalEventClaimMutation();
    const [decision, setDecision] = useState<{ claim: GlobalEventClaim, isApproved: boolean } | null>(null);
    const [comment, setComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const formatDate = (date: string) => new Date(date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

    if(user && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    const globalEvent = globalEventQuery.data?.globalEvent;
    const claims = claimsQuery.data?.claims;
    if(globalEventQuery.isError || claimsQuery.isError) {
        return(
            <div className="global-event-claims__message">
                <h2>{t("The event isn't found")}</h2>
                <CommonButton onClick={() => navigate('/')}>{t("To the main page")}</CommonButton>
            </div>
        );
    }

    if(!globalEvent || !claims) {
        return(
            <div className="global-event-claims__message">
                <CircularProgress color="primary" />
            </div>
        );
    }

    const gameOf = (appId: number) => globalEvent.games.find(game => game.appId === appId);
    const pending = claims.filter(claim => claim.status === ClaimStatus.Pending);
    const decided = claims.filter(claim => claim.status !== ClaimStatus.Pending);

    const openDecision = (claim: GlobalEventClaim, isApproved: boolean) => {
        setComment("");
        setError(null);
        setDecision({ claim, isApproved });
    };

    const confirmDecision = async () => {
        if(!decision) {
            return;
        }

        const { claim, isApproved } = decision;
        setDecision(null);
        try {
            await decide({ claimId: claim.id, isApproved, comment: isApproved ? undefined : comment.trim() || undefined }).unwrap();
        } catch {
            // the list is read again either way, the claim may be decided by another administrator
            setError(t("Couldn't decide the claim, the list is updated"));
            claimsQuery.refetch();
        }
    };

    const renderClaim = (claim: GlobalEventClaim) => {
        const game = gameOf(claim.appId);
        return(
            <GlobalEventGameCard
            key={claim.id}
            name={game?.game.name ?? `${claim.appId}`}
            imageUrl={game?.game.imageUrl ?? null}
            achievements={game?.achievements ?? []}
            actions={
                claim.status === ClaimStatus.Pending &&
                <>
                    <CommonButton color="success" disabled={decideResult.isLoading} onClick={() => openDecision(claim, true)}>{t("Approve")}</CommonButton>
                    <CommonButton color="error" disabled={decideResult.isLoading} onClick={() => openDecision(claim, false)}>{t("Reject")}</CommonButton>
                </>
            }>
                <div className="global-event-claims__info">
                    {claim.player && <Player player={claim.player} />}
                    <span>
                        {CLAIM_PLATFORM_NAME[claim.platform]}
                        {" · "}
                        <a href={claimProfileUrl(claim.platform, claim.profile)} target="_blank" rel="noreferrer" className="global-event-claims__profile">
                            {claim.profile}
                        </a>
                    </span>
                    <span className="global-event-claims__muted">{t("Sent on {{date}}", { date: formatDate(claim.createdAt) })}</span>
                    {
                        claim.status !== ClaimStatus.Pending &&
                        <span className={`global-event-claims__status global-event-claims__status--${claim.status === ClaimStatus.Approved ? "approved" : "rejected"}`}>
                            {claim.status === ClaimStatus.Approved ? t("Approved") : t("Rejected")}
                            {claim.decidedAt && ` ${formatDate(claim.decidedAt)}`}
                            {claim.decidedBy && ` · ${claim.decidedBy.userName}`}
                            {claim.comment && `: ${claim.comment}`}
                        </span>
                    }
                </div>
            </GlobalEventGameCard>
        );
    };

    return(
        <div className="global-event-claims">
            <header className="global-event-claims__header">
                <h1 className="global-event-claims__title">{t("Claims of the passing")}</h1>
                <Link to={globalEventPath(globalEvent.id)} className="global-event-claims__event">{globalEvent.name}</Link>
            </header>
            {error && <div className="global-event-claims__error">{error}</div>}
            <section className="global-event-claims__section">
                <h2 className="global-event-claims__section-title">{t("Under review: {{count}}", { count: pending.length })}</h2>
                {pending.length ? pending.map(renderClaim) : <p className="global-event-claims__muted">{t("No claims wait for the review")}</p>}
            </section>
            {
                !!decided.length &&
                <section className="global-event-claims__section">
                    <h2 className="global-event-claims__section-title">{t("Decided: {{count}}", { count: decided.length })}</h2>
                    {decided.map(renderClaim)}
                </section>
            }
            {
                decision && decision.claim.player &&
                <CommonModal
                name={decision.isApproved
                    ? t("Approve the claim of {{player}}?", { player: decision.claim.player.userName })
                    : t("Reject the claim of {{player}}?", { player: decision.claim.player.userName })}
                onConfirmText={decision.isApproved ? t("Approve") : t("Reject")}
                onCloseText={t("Cancel")}
                onConfirm={confirmDecision}
                onClose={() => setDecision(null)}>
                    {
                        decision.isApproved ?
                        <div className="global-event-claims__modal-text">
                            {t("The game «{{game}}» counts as passed, the participation of the player is over.", { game: gameOf(decision.claim.appId)?.game.name })}
                        </div>
                        :
                        <textarea
                        className="global-event-claims__comment"
                        placeholder={t("The reason for the player, may be empty")}
                        value={comment}
                        maxLength={GLOBAL_EVENT_CLAIM_COMMENT_MAX_LENGTH}
                        onChange={e => setComment(e.target.value)} />
                    }
                </CommonModal>
            }
        </div>
    );
};

export { GlobalEventClaimsPage }
