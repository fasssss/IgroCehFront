import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useActivateEventMutation, useSubmitPassingMutation, useSummarizeEventMutation } from "../../eventsApi";
import './styles.scss';
import { EventStatus } from "root/shared/constants";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import type { EventStageProps } from "../EventStageRouter";
import { useTranslation } from "react-i18next";
import { playerProfilePath } from "root/features/players/playerProfilePath";
import { useGetGuildByIdQuery } from "root/features/guilds/guildsApi";
import { guessGamePath } from "../../guessGamePath";
import { newcomerJoinPath } from "../../newcomerJoinPath";

// progress of passing the guessed games, after summarizing shows results of the event
const AuctionProgressPage = ({ event, currentUser }: EventStageProps) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const navigate = useNavigate();
    const [submitPassing] = useSubmitPassingMutation();
    const [summarizeEvent] = useSummarizeEventMutation();
    const [activateEvent] = useActivateEventMutation();
    const [isActivateConfirmShown, setIsActivateConfirmShown] = useState(false);
    const isCreator = currentUser.id === event.eventCreatorId;
    const isGuildAdmin = useGetGuildByIdQuery(guildId ? { guildId } : skipToken).data?.guildObject.isCurrentUserAdmin ?? false;
    const isActive = event.statusId === EventStatus.Active;
    const isGuessing = event.statusId === EventStatus.GuessingGames;
    const guessedCount = event.eventRecords.filter(record => record.game).length;
    // a member of the guild who isn't in the active event with a pool may join it as a newcomer
    const canJoinAsNewcomer = isActive && event.allowsNewcomers
        && !event.eventRecords.some(record => record.participant.id === currentUser.id || record.toUser?.id === currentUser.id);
    // the creator activates the event once every participant has guessed, until then the games can be changed
    const canActivate = guessedCount > 0 && guessedCount === event.eventRecords.length;

    return(
    <div className="auction-progress">
        <div className="auction-progress__header">
            <div className="auction-progress__event-name">
                <h1>{event.eventName}</h1>
            </div>
            <div className="auction-progress__event-actions">
                { isCreator && isGuessing &&
                    <>
                        { !canActivate &&
                            <div className="auction-progress__guessed-count">
                                {t("Games guessed: {{guessed}} of {{total}}", { guessed: guessedCount, total: event.eventRecords.length })}
                            </div>
                        }
                        <CommonButton
                        color="success"
                        disabled={!canActivate}
                        onClick={() => setIsActivateConfirmShown(true)}
                        >
                            {t("Activate event")}
                        </CommonButton>
                    </>
                }
                {
                    canJoinAsNewcomer &&
                    <CommonButton color="success" onClick={() => navigate(newcomerJoinPath(guildId, event.id))}>
                        {t("Join")}
                    </CommonButton>
                }
                {/* the games are played only after the activation, so there is nothing to summarize before it */}
                { isCreator && isActive &&
                    <CommonButton
                    color="warning"
                    onClick={() => summarizeEvent({ eventId: event.id })}
                    >
                        {t("Summarize and finish")}
                    </CommonButton>
                }
            </div>
        </div>
        {event.eventRecords.map(record => {
            return(
                record.game &&
                <div key={record.id} className="auction-progress__item-container">
                    <div className="auction-progress__info-part">
                        <div className="auction-progress__item-from"
                            onClick={() => navigate(playerProfilePath(record.participant.id, guildId))}
                        >
                            {record.participant.userName}
                            <img src={record.participant.avatarUrl ?? undefined} />
                        </div>
                        <div className="players-progress__direction-arrow"/>
                        <div className="auction-progress__item-game">
                            {record.game.name}
                            <img src={resolveImageUrl(record.game.imageUrl)} />
                        </div>
                        <div className="players-progress__direction-arrow"/>
                        <div className="auction-progress__item-to"
                            onClick={() => record.toUser && navigate(playerProfilePath(record.toUser.id, guildId))}
                        >
                            {record.toUser?.userName}
                            <img src={record.toUser?.avatarUrl ?? undefined} />
                            {record.isNewcomer && <div className="auction-progress__newcomer">{t("Newcomer")}</div>}
                        </div>
                    </div>
                    <div className="auction-progress__status-part">
                        {record.reward !== null ?
                            <div className="auction-progress__status-success">
                                {record.reward}/3
                            </div>
                            :
                            <div className="auction-progress__status-progress">
                                {/* the one who guessed the game confirms that it is passed, an admin of the guild can do it for any game */}
                                {isActive && (currentUser.id === record.participant.id || isGuildAdmin) &&
                                    <CommonButton
                                    color="success"
                                    onClick={() => {
                                        submitPassing({ eventRecordId: record.id, eventId: event.id })
                                    }}>
                                    <div className="auction-progress__status-button">
                                        {currentUser.id === record.participant.id ? t("Submit") : t("Submit as admin")}
                                    </div>
                                </CommonButton>
                                }
                                {isGuessing && currentUser.id === record.participant.id &&
                                    <CommonButton
                                    color="error"
                                    onClick={() => navigate(guessGamePath(guildId, event.id))}>
                                        <div className="auction-progress__status-button">
                                            {t("Change")}
                                        </div>
                                    </CommonButton>
                                }
                            </div>
                        }
                    </div>
                </div>
            )
        })}
        {
            isActivateConfirmShown &&
            <CommonModal
            name={t("Activate the event?")}
            onConfirmText={t("Yes")}
            onCloseText={t("No")}
            onConfirm={() => {
                setIsActivateConfirmShown(false);
                activateEvent({ eventId: event.id });
            }}
            onClose={() => setIsActivateConfirmShown(false)}>
                {t("After the activation the guessed games can't be changed.")}
            </CommonModal>
        }
    </div>
    );
}

export { AuctionProgressPage }
