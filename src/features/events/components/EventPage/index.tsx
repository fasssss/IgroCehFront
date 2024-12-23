import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux";
import { ArrowForwardIos, Logout } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { addRoom, leaveRoom, WebSocketMessage } from "root/shared/helpers/webSocketHelper";
import { CommonModal } from "root/shared/components/CommonModal";
import { RootState } from "root/shared/store";
import { CommonButton } from "root/shared/components/CommonButton";
import { CustomCard } from "root/shared/components/CustomCard";
import { 
    MoveEventToNextStageResponse,
    useGetEventByIdQuery, 
    useGetGuildByIdQuery, 
    useJoinEventMutation, 
    useMoveEventToNextStageMutation, 
    useRemoveFromEventMutation 
} from "../../eventsApi";
import './styles.scss';
import { EVENT_STATUS } from "root/shared/constants";

const EventPage = () => {
    const initializedPage = useRef(false); // need to eleminate rerenders when page is mounted
    const { guildId, eventId } = useParams();
    const [isJoinProposalShown, setIsJoinProposalShown] = useState(false);
    const getEventById = useGetEventByIdQuery({ eventId });
    const getGuildById = useGetGuildByIdQuery({ guildId });
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const navigate = useNavigate();
    const [joinEvent] = useJoinEventMutation();
    const [removeFromEvent, removeFromEventResult] = useRemoveFromEventMutation();
    const [moveEventToNextStage, moveEventToNextStageResult] = useMoveEventToNextStageMutation()
    const { t } = useTranslation()

    useEffect(() => {

    }, [])

    useEffect(() => {
        if(getEventById.isSuccess && userInfo.id !== null) {
            !getEventById.data.eventRecords.some(record => record.participant.id === userInfo.id) &&
                setIsJoinProposalShown(true);
        }

        if(getEventById.isSuccess) {
            switch (getEventById.data?.statusId) {
                case EVENT_STATUS.indexOf('Players shuffle'):
                    navigate(`/guild/${guildId}/event/${eventId}/ordering-stage`);
                    break;
                case EVENT_STATUS.indexOf('Guessing games'):
                    navigate(`/guild/${guildId}/event/${eventId}/guessing-stage`);
                    break;
                case EVENT_STATUS.indexOf('Active'):
                    navigate(`/guild/${guildId}/event/${eventId}/active-stage`);
                    break;
            }
        }
    }, [getEventById.isSuccess, userInfo]);

    useEffect(() => {
        if(removeFromEventResult.isSuccess) {
            navigate(`/guild/${guildId}`);
        }

    }, [removeFromEventResult.isSuccess]);

    useEffect(() => {
        const changeStatusEventListener = (event: MessageEvent) => {
            const data: WebSocketMessage<MoveEventToNextStageResponse> = JSON.parse(event.data);
            if (data.payload.moveToStage === 1) {
                navigate(`/guild/${guildId}/event/${eventId}/ordering-stage`);
            }
        }
        
        if(!initializedPage.current)
            addRoom(`event${eventId}updateEventStage`, changeStatusEventListener);
        initializedPage.current = true;
        return (() => {
            leaveRoom(`event${eventId}updateEventStage`, changeStatusEventListener);
        })
    }, [])

    useEffect(() => {
        if(moveEventToNextStageResult.isSuccess) {
            navigate(`/guild/${guildId}/event/${eventId}/ordering-stage`);
        }
    }, [moveEventToNextStageResult.isSuccess]);

    return (
        <div className="event-page">
            <div className="event-page__header">
                <div className="event-page__header-badge">
                    <img className="event-page__guild-image" src={getGuildById.data?.guildObject.iconUrl} />
                    <div className="event-page__event-name">{ getEventById.data?.eventName }</div>
                </div>
                <div className="event-page__header-buttons">
                    {
                        getEventById.data?.eventCreatorId === userInfo.id &&
                        <CommonButton 
                        onClick={() => moveEventToNextStage({ eventId: eventId || "", statusId: 1 })}
                        color="success" 
                        endIcon={<ArrowForwardIos />}>
                            {t("Travel to Auction!")}
                        </CommonButton>  
                    }
                    {
                        getEventById.data?.eventCreatorId !== userInfo.id &&
                        <CommonButton 
                        onClick={() => removeFromEvent({ userId: userInfo.id || "", eventId: eventId || "" })} 
                        color="error" 
                        endIcon={<Logout />}>
                            {t("Leave Event")}
                        </CommonButton> 
                    }
                </div>
            </div>
            <div className="event-page__body">
                {
                    getEventById.data?.eventRecords.map(record => {
                        return(
                            <CustomCard 
                            key={ record.id }
                            imageUrl={ record.participant.avatarUrl } 
                            name={ record.participant.userName }
                            >
                                {
                                    getEventById.data?.eventCreatorId === userInfo.id && 
                                    getEventById.data?.eventCreatorId !== record.participant.id &&
                                    <CommonButton 
                                    onClick={() => removeFromEvent({ userId: userInfo.id || "", eventId: eventId || "" })} 
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
                    joinEvent({ eventId: eventId || "" })
                }}
                onClose={() => { setIsJoinProposalShown(false) }}>
                    Do you want to join this event?
                </CommonModal>
            }
        </div>
    );
}

export { EventPage }