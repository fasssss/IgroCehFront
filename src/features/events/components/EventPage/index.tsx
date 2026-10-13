import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { ArrowForwardIos, Logout } from "@mui/icons-material";
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
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

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
    // proposal is shown only on opening, so a kicked participant doesn't get it
    const [isJoinProposalShown, setIsJoinProposalShown] = useState(!isParticipant);

    const leaveEvent = async () => {
        await removeFromEvent({ userId: currentUser.id, eventId: event.id }).unwrap();
        navigate(`/guild/${guildId}`);
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
                        isCreator &&
                        <CommonButton
                        onClick={() => moveEventToNextStage({ eventId: event.id, statusId: EventStatus.PlayersShuffle })}
                        color="success"
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
                name="Hark, noble wayfarer 🧙‍♂️"
                onConfirmText="Yes"
                onCloseText="No"
                onConfirm={() => {
                    setIsJoinProposalShown(false);
                    joinEvent({ eventId: event.id })
                }}
                onClose={() => { setIsJoinProposalShown(false) }}>
                    Do you want to join this event?
                </CommonModal>
            }
        </div>
    );
}

export { EventPage }
