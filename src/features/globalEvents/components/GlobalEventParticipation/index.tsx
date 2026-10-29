import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { Casino, CheckCircle } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import {
    GlobalEvent,
    GlobalEventGame,
    useGetGlobalEventParticipationQuery,
    usePickGlobalEventGameMutation,
    useRefuseGlobalEventGameMutation,
    useRollGlobalEventGamesMutation
} from "../../globalEventsApi";
import { GLOBAL_EVENT_REFUSAL_DELAY_DAYS } from "../../globalEventLimits";
import { formatTimeLeft, useNow } from "../../globalEventTime";
import { ClaimStatus } from "../../globalEventClaims";
import { GlobalEventGameCard } from "../GlobalEventGameCard";
import { GlobalEventPassingProof } from "../GlobalEventPassingProof";
import { GlobalEventRoll } from "../GlobalEventRoll";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// the roll of the current user on the page of a global event: three games drop, the player picks one of them,
// a week after the pick it can be refused for a new roll; the passing of the picked game ends the participation
const GlobalEventParticipation = ({ globalEvent }: GlobalEventParticipationProps) => {
    const { t, i18n } = useTranslation();
    const user = useCurrentUser();
    const participationQuery = useGetGlobalEventParticipationQuery(globalEvent.id, { refetchOnMountOrArgChange: true });
    const participation = participationQuery.data?.participation;
    const [roll, rollResult] = useRollGlobalEventGamesMutation();
    const [pick, pickResult] = usePickGlobalEventGameMutation();
    const [refuse, refuseResult] = useRefuseGlobalEventGameMutation();
    // the reels spin right after a roll, a roll made earlier is shown at once
    const [isSpinning, setIsSpinning] = useState(false);
    const [confirmedPick, setConfirmedPick] = useState<GlobalEventGame | null>(null);
    const [isConfirmingRefusal, setIsConfirmingRefusal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFinished = !!globalEvent.finishedAt;
    const isBusy = rollResult.isLoading || pickResult.isLoading || refuseResult.isLoading;
    const gameOf = (appId: number) => globalEvent.games.find(game => game.appId === appId);
    const rolledGames = (participation?.rolledAppIds ?? []).map(gameOf).filter((game): game is GlobalEventGame => !!game);
    const pickedGame = participation?.pickedAppId ? gameOf(participation.pickedAppId) : undefined;
    const refusableAt = participation?.refusableAt ? Date.parse(participation.refusableAt) : null;
    const now = useNow(refusableAt !== null && !isFinished);
    const canRefuse = refusableAt !== null && now >= refusableAt;

    const formatDate = (date: string) => new Date(date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

    const toErrorText = (requestError: unknown) => errorStatus(requestError) === 422
        ? t("No game of the event can drop to you: you have unlocked an achievement of every one")
        : t("Something went wrong, try again");

    const rollGames = async (request: typeof roll | typeof refuse) => {
        setIsConfirmingRefusal(false);
        setError(null);
        try {
            await request({ globalEventId: globalEvent.id }).unwrap();
            setIsSpinning(true);
        } catch(requestError) {
            setError(toErrorText(requestError));
        }
    };

    const pickGame = async () => {
        if(!confirmedPick) {
            return;
        }

        const appId = confirmedPick.appId;
        setConfirmedPick(null);
        setError(null);
        try {
            await pick({ globalEventId: globalEvent.id, appId }).unwrap();
        } catch(requestError) {
            setError(toErrorText(requestError));
        }
    };

    if(participationQuery.isLoading) {
        return(
            <section className="global-event-participation global-event-participation--loading">
                <CircularProgress color="primary" />
            </section>
        );
    }

    // nothing to take part in, nothing to show
    if(participationQuery.isError || (isFinished && !pickedGame)) {
        return null;
    }

    const renderContent = () => {
        if(!participation) {
            return(
                <>
                    <h2 className="global-event-participation__title">{t("Roll the games")}</h2>
                    <p className="global-event-participation__text">
                        {t("Three random games of the event drop, you pick one of them and pass it.")}
                        {user?.steamId && ` ${t("The games where you have unlocked the achievement already don't drop.")}`}
                    </p>
                    <div className="global-event-participation__actions">
                        <CommonButton color="success" startIcon={<Casino />} disabled={isBusy} onClick={() => rollGames(roll)}>
                            {t("Roll the games")}
                        </CommonButton>
                    </div>
                </>
            );
        }

        if(isSpinning) {
            return(
                <>
                    <h2 className="global-event-participation__title">{t("Rolling...")}</h2>
                    <GlobalEventRoll
                    games={globalEvent.games.map(game => game.game)}
                    rolled={rolledGames.map(game => game.game)}
                    onStopped={() => setIsSpinning(false)} />
                </>
            );
        }

        if(!pickedGame) {
            return(
                <>
                    <h2 className="global-event-participation__title">{t("Pick your game")}</h2>
                    <p className="global-event-participation__text">
                        {t("The picked game can be refused for a new roll only {{days}} days after the pick.", { days: GLOBAL_EVENT_REFUSAL_DELAY_DAYS })}
                    </p>
                    <div className="global-event-participation__games">
                        {
                            rolledGames.map(game =>
                                <GlobalEventGameCard
                                key={game.appId}
                                name={game.game.name}
                                imageUrl={game.game.imageUrl}
                                achievements={game.achievements}
                                actions={
                                    <CommonButton color="success" disabled={isBusy} onClick={() => setConfirmedPick(game)}>
                                        {t("Pick")}
                                    </CommonButton>
                                } />
                            )
                        }
                    </div>
                </>
            );
        }

        const isPassed = !!participation.passedAt;
        const isClaimPending = participation.claim?.status === ClaimStatus.Pending;
        return(
            <>
                <h2 className="global-event-participation__title">{t("Your game")}</h2>
                <GlobalEventGameCard name={pickedGame.game.name} imageUrl={pickedGame.game.imageUrl} achievements={pickedGame.achievements} />
                {
                    participation.passedAt ?
                    <div className="global-event-participation__passed">
                        <CheckCircle />
                        {t("Passed on {{date}}", { date: formatDate(participation.passedAt) })}
                        {" · "}
                        {participation.claim?.status === ClaimStatus.Approved ? t("by a claim") : t("by Steam")}
                    </div>
                    : isFinished ?
                    <p className="global-event-participation__text">
                        {isClaimPending ? t("The claim is under review") : t("The event is finished, the game isn't passed")}
                    </p>
                    :
                    <GlobalEventPassingProof globalEvent={globalEvent} game={pickedGame} participation={participation} />
                }
                {
                    // a passed game or one with a claim under review stays
                    !isFinished && !isPassed && !isClaimPending && refusableAt !== null &&
                    <div className="global-event-participation__refusal">
                        <CommonButton color="warning" disabled={!canRefuse || isBusy} onClick={() => setIsConfirmingRefusal(true)}>
                            {t("Refuse and roll again")}
                        </CommonButton>
                        <span className="global-event-participation__text">
                            {
                                canRefuse ?
                                t("You can refuse the game and roll three new ones.")
                                :
                                t("The game can be refused {{days}} days after the pick. You can roll again in {{left}}", {
                                    days: GLOBAL_EVENT_REFUSAL_DELAY_DAYS,
                                    left: formatTimeLeft(refusableAt - now, t)
                                })
                            }
                        </span>
                    </div>
                }
            </>
        );
    };

    return(
        <section className="global-event-participation">
            {renderContent()}
            {error && <div className="global-event-participation__error">{error}</div>}
            {
                confirmedPick &&
                <CommonModal
                name={t("Pick «{{name}}»?", { name: confirmedPick.game.name })}
                onConfirmText={t("Pick")}
                onCloseText={t("Cancel")}
                onConfirm={pickGame}
                onClose={() => setConfirmedPick(null)}>
                    <div className="global-event-participation__modal-text">
                        {t("You can refuse it and roll again only {{days}} days after the pick.", { days: GLOBAL_EVENT_REFUSAL_DELAY_DAYS })}
                    </div>
                </CommonModal>
            }
            {
                isConfirmingRefusal && pickedGame &&
                <CommonModal
                name={t("Refuse «{{name}}»?", { name: pickedGame.game.name })}
                onConfirmText={t("Refuse and roll again")}
                onCloseText={t("Cancel")}
                onConfirm={() => rollGames(refuse)}
                onClose={() => setIsConfirmingRefusal(false)}>
                    <div className="global-event-participation__modal-text">
                        {t("Three new games drop, this one won't be among them. The next refusal is possible {{days}} days after the new pick.", {
                            days: GLOBAL_EVENT_REFUSAL_DELAY_DAYS
                        })}
                    </div>
                </CommonModal>
            }
        </section>
    );
};

type GlobalEventParticipationProps = {
    globalEvent: GlobalEvent
}

export { GlobalEventParticipation }
