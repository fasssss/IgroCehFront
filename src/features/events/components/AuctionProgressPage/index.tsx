import { useParams } from "react-router-dom";
import { useGetEventByIdQuery } from "../../eventsApi";
import { useEffect } from "react";

const AuctionProgressPage = () => {
    const { eventId } = useParams();
    const eventById = useGetEventByIdQuery({ eventId: eventId });

    useEffect(() => {
        
    }, []);

    return(
    <div>
        {eventById.data?.eventRecords.map(record => {
            return(
                record.game &&
                <div>
                    {record.game.name}
                </div>
            )
        })}
    </div>
    );
}

export { AuctionProgressPage }