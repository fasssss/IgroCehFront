import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux";
import { CommonModal } from "root/shared/components/CommonModal";
import { RootState } from "root/shared/store";
import { EventUserCard } from "../EventUserCard";
import { useGetEventByIdQuery, useGetGuildByIdQuery, useJoinEventMutation } from "../../eventsApi";
import './styles.scss';
import { CommonButton } from "root/shared/components/CommonButton";
import { ArrowForwardIos, Logout } from "@mui/icons-material";

const EventPage = () => {
    const { guildId, eventId } = useParams();
    const [isJoinProposalShown, setIsJoinProposalShown] = useState(false);
    const getEventById = useGetEventByIdQuery({ eventId });
    const getGuildById = useGetGuildByIdQuery({ guildId });
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const [joinEvent, _] = useJoinEventMutation();

    useEffect(() => {
        if(getEventById.isSuccess && userInfo.id !== null) {
            !getEventById.data.eventRecords.some(record => record.participant.id === userInfo.id) &&
                setIsJoinProposalShown(true);
        }
    }, [getEventById.isSuccess, userInfo]);

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
                        <CommonButton color="success" endIcon={<ArrowForwardIos />}>
                            Travel to Auction!
                        </CommonButton>  
                    }
                    {
                        getEventById.data?.eventCreatorId !== userInfo.id &&
                        <CommonButton color="error" endIcon={<Logout />}>
                            Leave Event
                        </CommonButton> 
                    }
                </div>
            </div>
            <div className="event-page__body">
                {
                    getEventById.data?.eventRecords.map(record => {
                        return(
                            <EventUserCard 
                            key={ record.id }
                            avatarUrl={ record.participant.avatarUrl } 
                            userName={ record.participant.userName }
                            />
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