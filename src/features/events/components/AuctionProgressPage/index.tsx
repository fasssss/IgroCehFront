import { useParams } from "react-router-dom";
import { useLazyGetEventByIdQuery } from "../../eventsApi";
import { useEffect } from "react";

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
    <div>
        {getEventByIdResult.data?.eventRecords.map(record => {
            return(
                record.game &&
                <div key={record.id}>
                    {record.game.name}
                </div>
            )
        })}
    </div>
    );
}

export { AuctionProgressPage }