import { useParams } from "react-router-dom";
import { useLazyGetEventByIdQuery, useSubmitPassingMutation } from "../../eventsApi";
import { useEffect } from "react";
import './styles.scss';
import { igroCehApiBaseUrl } from "root/shared/constants";
import { CommonButton } from "root/shared/components/CommonButton";
import { RootState } from "root/shared/store";
import { useSelector } from "react-redux";

const AuctionProgressPage = () => {
    const { eventId } = useParams();
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const [getEventById, getEventByIdResult] = useLazyGetEventByIdQuery();
    const [submitPassing] = useSubmitPassingMutation();

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
        <div className="auction-progress__header">
            <div className="auction-progress__event-name">
                <h1>{getEventByIdResult.data?.eventName}</h1>
            </div>
            <div className="auction-progress__event-actions">
                <CommonButton color="warning">
                    Summarize and finish
                </CommonButton>
            </div>
        </div>
        {getEventByIdResult.data?.eventRecords.map(record => {
            return(
                record.game &&
                <div key={record.id} className="auction-progress__item-container">
                    <div className="auction-progress__info-part">
                        <div className="auction-progress__item-from">
                            {record.participant.userName}
                            <img src={record.participant.avatarUrl} />
                        </div>
                        <div className="auction-progress__item-game">
                            {record.game.name}
                            <img src={igroCehApiBaseUrl + record.game.imageUrl} />
                        </div>
                        <div className="auction-progress__item-to">
                            {record.toUser?.userName}
                            <img src={record.toUser?.avatarUrl} />
                        </div>
                    </div>
                    <div className="auction-progress__status-part">
                        {record.reward ?
                            <div className="auction-progress__status-success">
                                {record.reward}/3
                            </div>
                            :
                            <div className="auction-progress__status-progress">
                                {userInfo.id === record.participant.id ||
                                 userInfo.id === getEventByIdResult.data?.eventCreatorId &&
                                    <CommonButton 
                                    color="success"
                                    onClick={() => {
                                        submitPassing({ eventRecordId: record.id, eventId: eventId || "" })
                                    }}>
                                    <div className="auction-progress__status-button">
                                        Submit
                                    </div>
                                </CommonButton>
                                }
                            </div>
                        }
                    </div>
                </div>
            )
        })}
    </div>
    );
}

export { AuctionProgressPage }