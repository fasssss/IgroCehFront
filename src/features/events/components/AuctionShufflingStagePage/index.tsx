import { useParams } from "react-router-dom";
import { 
    useGetEventByIdQuery,
    //useShuffleUsersMutation
} from "../../eventsApi";
import './styles.scss';
import { CustomCard } from "root/shared/components/CustomCard";
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
                        <CustomCard
                        onClick={() => setIsCardsShown(isCardsShown.map((val, shownIndex) => true))}
                        key={ record.id }
                        imageUrl={ record.participant.avatarUrl } 
                        name={ record.participant.userName }
                        isShown={isCardsShown[index]}
                        />
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