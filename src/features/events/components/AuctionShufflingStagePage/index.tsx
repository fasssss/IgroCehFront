import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import StyleIcon from '@mui/icons-material/Style';
import { CustomCard } from "root/shared/components/CustomCard";
import { CommonButton } from "root/shared/components/CommonButton";
import { RootState } from "root/shared/store";
import { addRoom, ensureConnection, leaveRoom, WebSocketMessage } from "root/shared/helpers/webSocketHelper";
import { 
    //useGetEventByIdQuery,
    useLazyGetEventByIdQuery,
    useShuffleUsersMutation
} from "../../eventsApi";
import './styles.scss';

const AuctionShufflingStagePage = () => {
    const { eventId } = useParams();
    const initialMount = useRef(false);
    const [getEventById, eventById] = useLazyGetEventByIdQuery();
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const [isCardsShown, setIsCardsShown] = useState([] as boolean[]);
    const [shuffleUsers, shuffleUsersResult] = useShuffleUsersMutation();

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

        getEventById({ eventId });
        if(!initialMount.current){
            addRoom(`event${eventId}`, shuffleWebsocketHandler);
        }
        initialMount.current = true;
        return(() => {
            leaveRoom(`event${eventId}`, shuffleWebsocketHandler)
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
                onClick={() => {}}
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