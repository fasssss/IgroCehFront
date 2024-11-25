import { useParams } from "react-router-dom";
import { 
    useGetEventByIdQuery,
    //useShuffleUsersMutation
} from "../../eventsApi";
import './styles.scss';
import { EventUserCard } from "../EventUserCard";
import { useEffect, useState } from "react";

const AuctionShufflingStagePage = () => {
    const { eventId } = useParams();
    const getEventById = useGetEventByIdQuery({ eventId });
    const [isCardsShown, setIsCardsShown] = useState([] as boolean[])
    //const [shuffleUsers] = useShuffleUsersMutation({ eventId });

    useEffect(() => {
        if(getEventById.data) {
            setIsCardsShown(Array(getEventById.data.eventRecords.length).fill(false));
        }
    }, [getEventById.isSuccess]);
    
    return(
    <div className="players-shuffle">
        {
            getEventById.data && getEventById.isSuccess &&
            getEventById.data?.eventRecords.map((record, index) => {
                return(
                    <div key={record.id}  className="players-shuffle__card-container">
                        <div className={`players-shuffle__card ${isCardsShown[index] ? "" : "flipped"}`}
                        onClick={() => { setIsCardsShown(isCardsShown.map((val, shownIndex) => index === shownIndex)) }}>
                            <div className="players-shuffle__card-back">

                            </div>
                            <div className="players-shuffle__card-front">
                                <EventUserCard
                                key={ record.id }
                                avatarUrl={ record.participant.avatarUrl } 
                                userName={ record.participant.userName }
                                />
                            </div>
                        </div>
                        {
                            index < (getEventById.data?.eventRecords.length || 0) - 1 &&
                            <div className="players-shuffle__direction-arrow"/>
                        }
                    </div>
                )
            })
        }
    </div>
    );
}

export { AuctionShufflingStagePage }