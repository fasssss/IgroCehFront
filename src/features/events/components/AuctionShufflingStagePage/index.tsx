import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import StyleIcon from '@mui/icons-material/Style';
import { CustomCard } from "root/shared/components/CustomCard";
import { CommonButton } from "root/shared/components/CommonButton";
import { RootState } from "root/shared/store";
import { addRoom, ensureConnection, leaveRoom, WebSocketMessage } from "root/shared/helpers/webSocketHelper";
import { 
    MoveEventToNextStageResponse,
    useLazyGetEventByIdQuery,
    useMoveEventToNextStageMutation,
    useShuffleUsersMutation
} from "../../eventsApi";
import './styles.scss';
import { EVENT_STATUS } from "root/shared/constants";

const AuctionShufflingStagePage = () => {
    const { guildId, eventId } = useParams();
    const initialMount = useRef(false);
    const [getEventById, eventById] = useLazyGetEventByIdQuery();
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const [isCardsShown, setIsCardsShown] = useState([] as boolean[]);
    const [shuffleUsers, shuffleUsersResult] = useShuffleUsersMutation();
    const navigate = useNavigate();
    const [moveEventToNextStage, moveEventToNextStageResult] = useMoveEventToNextStageMutation();

    useEffect(() => {
        ensureConnection();
        const shuffleWebsocketHandler = (event: MessageEvent) => {
            getEventById({ eventId });
            const data: WebSocketMessage<boolean> = JSON.parse(event.data);
            if(data.type === "shuffleUsers" && data.payload) {
                const isShown = [...isCardsShown];
                isShown[isShown.indexOf(false)] = true;
                setIsCardsShown(isShown);
            }
        };

        const moveNextStageWebsocketHandler = (event: MessageEvent) => {
            const data: WebSocketMessage<MoveEventToNextStageResponse> = JSON.parse(event.data);
            console.log(data.payload);
            if(data.payload.moveToStage === 2) {
                navigate(`/guild/${guildId}/event/${eventId}/guessing-stage`);
            }
        };

        getEventById({ eventId });
        if(!initialMount.current){
            addRoom(`event${eventId}`, shuffleWebsocketHandler);
            addRoom(`event${eventId}updateEventStage`, moveNextStageWebsocketHandler);
        }
        initialMount.current = true;
        return(() => {
            leaveRoom(`event${eventId}`, shuffleWebsocketHandler)
            leaveRoom(`event${eventId}updateEventStage`, moveNextStageWebsocketHandler)
        });
    }, []);

    useEffect(() => {
        if(eventById.data) {
            setIsCardsShown(Array(eventById.data.eventRecords.length).fill(false));
        }
    }, [eventById.isSuccess, shuffleUsersResult.isLoading]);

    useEffect(() => {     //useEffect for sequenced animation flipping of cards
        if(shuffleUsersResult.isSuccess &&
            !shuffleUsersResult.isLoading && 
            isCardsShown.indexOf(false) !== -1
        ) {
            const isShown = [...isCardsShown];
            isShown[isShown.indexOf(false)] = true;
            const timeout = setTimeout(() => setIsCardsShown(isShown), 150);
            return (() => {
                clearTimeout(timeout);
            });
        }
    }, [shuffleUsersResult.isLoading, isCardsShown]);

    useEffect(() => {
        if(moveEventToNextStageResult.isSuccess) {
            navigate(`/guild/${guildId}/event/${eventId}/guessing-stage`);
        }
    }, [moveEventToNextStageResult.isSuccess]);

    useEffect(() => {
        switch (eventById.data?.statusId) {
            case EVENT_STATUS.indexOf('Players registration'):
                navigate(`/guild/${guildId}/event/${eventId}`);
                break;
            case EVENT_STATUS.indexOf('Guessing games'):
                navigate(`/guild/${guildId}/event/${eventId}/guessing-stage`);
                break;
            case EVENT_STATUS.indexOf('Active'):
                navigate(`/guild/${guildId}/event/${eventId}/active-stage`);
                break;
        }
    }, [])
    
    return(
    <div className="players-shuffle">
        <div className="players-shuffle__header">
            {
                userInfo.id === eventById.data?.eventCreatorId && 
                <CommonButton 
                endIcon={<StyleIcon />}
                onClick={() => shuffleUsers({ eventId })}>
                    Let's dance... I mean shuffle
                </CommonButton>
            }
            {
                userInfo.id === eventById.data?.eventCreatorId &&
                <CommonButton 
                endIcon={<DoubleArrowIcon />}
                onClick={() => moveEventToNextStage({ eventId: eventId || "", statusId: 2 })}
                color="success"
                disabled={!isCardsShown[isCardsShown.length - 1]}>
                    Move next stage
                </CommonButton>
            }
        </div>
        <div className="players-shuffle__body">
            {
                eventById.data && 
                eventById.data?.eventRecords.map((record, index) => {
                    return(
                        <div key={record?.id}  className="players-shuffle__card-container">
                            <CustomCard
                            key={ record?.id }
                            imageUrl={ record?.participant.avatarUrl } 
                            name={ record?.participant.userName }
                            isShown={isCardsShown[index]}
                            />
                            {
                                index < (eventById.data?.eventRecords.length || 0) - 1 &&
                                <div className="players-shuffle__direction-arrow"/>
                            }
                        </div>
                    )
                })
            }
        </div>
    </div>
    );
}

export { AuctionShufflingStagePage }