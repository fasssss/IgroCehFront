import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { CustomCard } from "root/shared/components/CustomCard";
import { CommonButton } from "root/shared/components/CommonButton";
import { 
    useGetEventByIdQuery,
    useShuffleUsersMutation
} from "../../eventsApi";
import './styles.scss';

const AuctionShufflingStagePage = () => {
    const { eventId } = useParams();
    const getEventById = useGetEventByIdQuery({ eventId });
    const [isCardsShown, setIsCardsShown] = useState([] as boolean[]);
    const [shuffleUsers, shuffleUsersResult] = useShuffleUsersMutation();

    useEffect(() => {
        if(getEventById.data) {
            setIsCardsShown(Array(getEventById.data.eventRecords.length).fill(false));
        }
    }, [getEventById.isSuccess, shuffleUsersResult.isLoading]);

    useEffect(() => {                                                           //useEffect for sequenced animation flipping of cards
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
            <CommonButton 
            endIcon={<DoubleArrowIcon />}
            onClick={() => shuffleUsers({ eventId })}>
                Let's dance... I mean shuffle
            </CommonButton>
        </div>
        <div className="players-shuffle__body">
            {
                getEventById.data && isCardsShown.length && 
                getEventById.data?.eventRecords.map((record, index) => {
                    return(
                        <div key={record.id}  className="players-shuffle__card-container">
                            <CustomCard
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
    </div>
    );
}

export { AuctionShufflingStagePage }