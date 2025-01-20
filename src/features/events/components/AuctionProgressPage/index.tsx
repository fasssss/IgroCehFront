import { useParams } from "react-router-dom";
import { useLazyGetEventByIdQuery } from "../../eventsApi";
import { useEffect } from "react";
import './styles.scss';

const AuctionProgressPage = () => {
    const { eventId } = useParams();
    const [getEventById, getEventByIdResult] = useLazyGetEventByIdQuery();

    useEffect(() => {
        getEventById({ eventId: eventId });
    }, []);

    useEffect(() => {
        if(getEventByIdResult.isSuccess){
            console.log(getEventByIdResult);
        }
    }, [getEventByIdResult.data]);

    return(
    <div className="auction-progress">
        {getEventByIdResult.data?.eventRecords.map(record => {
            return(
                record.game &&
                <div key={record.id} className="auction-progress__item-container">
                    <div className="auction-progress__item-from">
                        {record.participant.userName}
                        <img src={record.participant.avatarUrl} />
                    </div>
                    <div className="auction-progress__item-game">
                        {record.game.name}
                        <img src={record.game.imageUrl} className="auction-progress__item-game-image" />
                    </div>
                    <div className="auction-progress__item-to">
                        {record.toUser?.userName}
                        <img src={record.toUser?.avatarUrl} />
                    </div>
                </div>
            )
        })}
    </div>
    );
}

export { AuctionProgressPage }