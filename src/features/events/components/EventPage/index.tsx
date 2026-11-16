import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { ArrowForwardIos, Logout, SportsEsportsOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CommonModal } from "root/shared/components/CommonModal";
import { CommonButton } from "root/shared/components/CommonButton";
import { CustomCard } from "root/shared/components/CustomCard";
import { EventStatus } from "root/shared/constants";
import { useGetGuildByIdQuery } from "root/features/guilds/guildsApi";
import {
    useJoinEventMutation,
    useMoveEventToNextStageMutation,
    useRemoveFromEventMutation
} from "../../eventsApi";
import { useGetNewcomerPoolQuery } from "../../newcomerPoolApi";
import { newcomerPoolPath } from "../../newcomerPoolPath";
import type { NewcomerPoolPageState } from "../NewcomerPoolPage";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

// mirrors MinPlayersCount on backend: with fewer players there is nobody to guess a game for
const MIN_PLAYERS_COUNT = 2;

// players registration stage
const EventPage = ({ event, currentUser }: EventStageProps) => {
    const { guildId } = useParams();
    const getGuildById = useGetGuildByIdQuery(guildId ? { guildId } : skipToken);
    const navigate = useNavigate();
    const [joinEvent] = useJoinEventMutation();
    const [removeFromEvent] = useRemoveFromEventMutation();
    const [moveEventToNextStage] = useMoveEventToNextStageMutation()
    const { t } = useTranslation()
    const isCreator = event.eventCreatorId === currentUser.id;
    const isParticipant = event.eventRecords.some(record => record.participant.id === currentUser.id);
    const hasEnoughPlayers = event.eventRecords.length >= MIN_PLAYERS_COUNT;
    // with newcomers allowed the registration ends once the pool has enough games for them
    const pool = useGetNewcomerPoolQuery(event.allowsNewcomers ? event.id : skipToken).data;
    const hasEnoughPoolGames = !event.allowsNewcomers || (!!pool && pool.games.length >= pool.minGames);
    // the pool counts up to the games the registration needs, then just counts
    const poolCountText = pool && (pool.games.length < pool.minGames
        ? t("Games for newcomers: {{count}} of {{min}}", { count: pool.games.length, min: pool.minGames })
        : t("Games for newcomers: {{count}}", { count: pool.games.length }));
    const nextStageHint = !hasEnoughPlayers ? t("At least 2 players are needed")
        : !hasEnoughPoolGames && pool ? t("At least {{min}} games are needed in the pool", { min: pool.minGames })
        : null;
    // proposal is shown only on opening, so a kicked participant doesn't get it
    const [isJoinProposalShown, setIsJoinProposalShown] = useState(!isParticipant);
    const [isNextStageConfirmShown, setIsNextStageConfirmShown] = useState(false);

    const leaveEvent = async () => {
        await removeFromEvent({ userId: currentUser.id, eventId: event.id }).unwrap();
        navigate(`/guild/${guildId}`);
    };

    // a player who has joined is offered to put a game for newcomers at once
    const join = async () => {
        await joinEvent({ eventId: event.id }).unwrap();
        if(event.allowsNewcomers) {
            const state: NewcomerPoolPageState = { isJustJoined: true };
            navigate(newcomerPoolPath(guildId, event.id), { state });
        }
    };

    return (
        <div className="event-page">
            <div className="event-page__header">
                <div className="event-page__header-badge">
                    <img className="event-page__guild-image" src={getGuildById.data?.guildObject.iconUrl ?? undefined} />
                    <div className="event-page__event-name">{ event.eventName }</div>
                </div>
                <div className="event-page__header-buttons">
                    {
                        isCreator && nextStageHint &&
                        <div className="event-page__hint">{nextStageHint}</div>
                    }
                    {
                        pool && (
                            isParticipant ?
                            <CommonButton onClick={() => navigate(newcomerPoolPath(guildId, event.id))} endIcon={<SportsEsportsOutlined />}>
                                {poolCountText}
                            </CommonButton>
                            :
                            <div className="event-page__hint">{poolCountText}</div>
                        )
                    }
                    {
                        isCreator &&
                        <CommonButton
                        onClick={() => setIsNextStageConfirmShown(true)}
                        color="success"
                        disabled={!hasEnoughPlayers || !hasEnoughPoolGames}
                        endIcon={<ArrowForwardIos />}>
                            {t("Travel to Auction!")}
                        </CommonButton>
                    }
                    {
                        !isCreator && isParticipant &&
                        <CommonButton
                        onClick={leaveEvent}
                        color="error"
                        endIcon={<Logout />}>
                            {t("Leave Event")}
                        </CommonButton>
                    }
                </div>
            </div>
            <div className="event-page__body">
                {
                    event.eventRecords.map(record => {
                        return(
                            <CustomCard
                            key={ record.id }
                            imageUrl={ record.participant.avatarUrl ?? undefined }
                            name={ record.participant.userName }
                            >
                                {
                                    isCreator &&
                                    event.eventCreatorId !== record.participant.id &&
                                    <CommonButton
                                    onClick={() => removeFromEvent({ userId: record.participant.id, eventId: event.id })}
                                    color="error"
                                    endIcon={<Logout />}>
                                        {t("Kick from event")}
                                    </CommonButton>
                                }
                            </CustomCard>
                        );
                    })
                }
            </div>
            {
                isJoinProposalShown &&
                <CommonModal
                name={`${t("Hark, noble wayfarer")} 🧙‍♂️`}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={() => {
                    setIsJoinProposalShown(false);
                    join();
                }}
                onClose={() => { setIsJoinProposalShown(false) }}>
                    {t("Do you want to join this event?")}
                </CommonModal>
            }
            {
                isNextStageConfirmShown &&
                <CommonModal
                name={t("Move on to the auction?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={() => {
                    setIsNextStageConfirmShown(false);
                    moveEventToNextStage({ eventId: event.id, statusId: EventStatus.PlayersShuffle });
                }}
                onClose={() => setIsNextStageConfirmShown(false)}>
                    {
                        event.allowsNewcomers ?
                        t("After moving on to the next stage new players will join only after the start, getting a game from the pool.")
                        :
                        t("After moving on to the next stage new players won't be able to join the event.")
                    }
                </CommonModal>
            }
        </div>
    );
}

export { EventPage }
