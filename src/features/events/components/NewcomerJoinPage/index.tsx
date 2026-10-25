import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { CasinoOutlined, ImageNotSupportedOutlined } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { EventRecord } from "../../eventsApi";
import { useGetNewcomerRollQuery, useJoinAsNewcomerMutation } from "../../newcomerPoolApi";
import { NewcomerRoulette } from "../NewcomerRoulette";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

// the event page opens by itself a moment after the game is shown
const SHOW_DROPPED_MS = 3000;

// a member of the guild who isn't in the active event crosses out the games of the pool they have passed and rolls one of the rest
const NewcomerJoinPage = ({ event, currentUser }: EventStageProps) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const navigate = useNavigate();
    const roll = useGetNewcomerRollQuery(event.id, { refetchOnMountOrArgChange: true });
    const [joinAsNewcomer, joinResult] = useJoinAsNewcomerMutation();
    const [excludedIds, setExcludedIds] = useState<string[]>([]);
    const [dropped, setDropped] = useState<EventRecord | null>(null);
    const [isStopped, setIsStopped] = useState(false);
    const eventPath = `/guild/${guildId}/event/${event.id}`;

    useEffect(() => {
        if(!isStopped) return;
        const timeout = setTimeout(() => navigate(eventPath, { replace: true }), SHOW_DROPPED_MS);
        return () => clearTimeout(timeout);
    }, [isStopped, eventPath, navigate]);

    // the record of the newcomer comes to the event at once, the page stays until the roll is shown
    const isInEvent = event.eventRecords.some(record => record.participant.id === currentUser.id || record.toUser?.id === currentUser.id);
    if(isInEvent && !dropped) {
        return <Navigate to={eventPath} replace />;
    }

    if(roll.isError) {
        return(
            <div className="newcomer-join newcomer-join__message">
                {t("You can't join this event now")}
                <CommonButton onClick={() => navigate(eventPath)}>{t("Back to the event")}</CommonButton>
            </div>
        );
    }

    if(!roll.data) {
        return(
            <div className="newcomer-join newcomer-join__message">
                <CircularProgress color="primary" />
            </div>
        );
    }

    const { games, hiddenCount, minGames } = roll.data;
    const rest = games.filter(poolGame => !excludedIds.includes(poolGame.id));
    // with fewer games than the minimum nothing is crossed out, the newcomer rolls from what there is
    const canCrossOut = rest.length > minGames;

    const toggle = (poolGameId: string) => setExcludedIds(excludedIds.includes(poolGameId)
        ? excludedIds.filter(id => id !== poolGameId)
        : [...excludedIds, poolGameId]);

    const spin = async () => {
        try {
            const { eventRecordObject } = await joinAsNewcomer({ eventId: event.id, excludedPoolGameIds: excludedIds }).unwrap();
            setDropped(eventRecordObject);
        } catch {
            // the error is shown under the button
        }
    };

    if(dropped?.game) {
        return(
            <div className="newcomer-join">
                <h1 className="newcomer-join__title">{t("Rolling a game for you")}</h1>
                <NewcomerRoulette games={rest.map(poolGame => poolGame.game)} dropped={dropped.game} onStopped={() => setIsStopped(true)} />
                {
                    isStopped &&
                    <div className="newcomer-join__dropped">
                        <div className="newcomer-join__dropped-text">{t("Your game: {{game}}", { game: dropped.game.name })}</div>
                        <CommonButton color="success" onClick={() => navigate(eventPath, { replace: true })}>{t("To the event")}</CommonButton>
                    </div>
                }
            </div>
        );
    }

    return(
        <div className="newcomer-join">
            <div className="newcomer-join__header">
                <h1 className="newcomer-join__title">{t("Joining “{{event}}”", { event: event.eventName })}</h1>
                <div className="newcomer-join__description">
                    {t("Cross out the games you have passed and roll: one of the rest will be yours. Points count as for everyone, from the start of the event.")}
                </div>
                {
                    hiddenCount > 0 &&
                    <div className="newcomer-join__note">{t("{{count}} more games are hidden, you have got them already", { count: hiddenCount })}</div>
                }
            </div>
            {
                games.length ?
                <>
                    <div className="newcomer-join__games">
                        {
                            games.map(poolGame => {
                                const isExcluded = excludedIds.includes(poolGame.id);
                                return(
                                    <div key={poolGame.id} className={`newcomer-join__game ${isExcluded ? "newcomer-join__game--excluded" : ""}`}>
                                        {
                                            poolGame.game.imageUrl ?
                                            <img src={resolveImageUrl(poolGame.game.imageUrl)} className="newcomer-join__cover" alt="" />
                                            :
                                            <div className="newcomer-join__cover newcomer-join__cover--empty">
                                                <ImageNotSupportedOutlined />
                                            </div>
                                        }
                                        <div className="newcomer-join__game-name">{poolGame.game.name}</div>
                                        <CommonButton
                                        color={isExcluded ? "primary" : "error"}
                                        disabled={!isExcluded && !canCrossOut}
                                        onClick={() => toggle(poolGame.id)}>
                                            {isExcluded ? t("Bring back") : t("Already passed")}
                                        </CommonButton>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="newcomer-join__actions">
                        <div className="newcomer-join__count">{t("Games to roll from: {{count}}", { count: rest.length })}</div>
                        {
                            !canCrossOut &&
                            <div className="newcomer-join__note">
                                {games.length > minGames ? t("At least {{min}} games stay to roll from", { min: minGames }) : t("Too few games to cross any out")}
                            </div>
                        }
                        <CommonButton color="success" endIcon={<CasinoOutlined />} disabled={joinResult.isLoading} onClick={spin}>
                            {t("Roll")}
                        </CommonButton>
                        {joinResult.isError && <div className="newcomer-join__error">{t("Couldn't join, try again")}</div>}
                        <CommonButton onClick={() => navigate(eventPath)}>{t("Back to the event")}</CommonButton>
                    </div>
                </>
                :
                <div className="newcomer-join__message">
                    {t("There are no games in the pool you haven't got yet")}
                    <CommonButton onClick={() => navigate(eventPath)}>{t("Back to the event")}</CommonButton>
                </div>
            }
        </div>
    );
};

export { NewcomerJoinPage }
