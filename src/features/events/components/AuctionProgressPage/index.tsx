import { useSubmitPassingMutation, useSummarizeEventMutation } from "../../eventsApi";
import './styles.scss';
import { EventStatus, igroCehApiBaseUrl } from "root/shared/constants";
import { CommonButton } from "root/shared/components/CommonButton";
import type { EventStageProps } from "../EventStageRouter";
import { t } from "i18next";

// progress of passing the guessed games, after summarizing shows results of the event
const AuctionProgressPage = ({ event, currentUser }: EventStageProps) => {
    const [submitPassing] = useSubmitPassingMutation();
    const [summarizeEvent] = useSummarizeEventMutation();
    const isCreator = currentUser.id === event.eventCreatorId;
    const isFinished = event.statusId === EventStatus.Finished;

    return(
    <div className="auction-progress">
        <div className="auction-progress__header">
            <div className="auction-progress__event-name">
                <h1>{event.eventName}</h1>
            </div>
            <div className="auction-progress__event-actions">
                { isCreator && !isFinished &&
                    <CommonButton
                    color="warning"
                    onClick={() => summarizeEvent({ eventId: event.id })}
                    >
                        {t("Summarize and finish")}
                    </CommonButton>
                }
            </div>
        </div>
        {event.eventRecords.map(record => {
            return(
                record.game &&
                <div key={record.id} className="auction-progress__item-container">
                    <div className="auction-progress__info-part">
                        <div className="auction-progress__item-from">
                            {record.participant.userName}
                            <img src={record.participant.avatarUrl ?? undefined} />
                        </div>
                        <div className="auction-progress__item-game">
                            {record.game.name}
                            <img src={record.game.imageUrl ? igroCehApiBaseUrl + record.game.imageUrl : undefined} />
                        </div>
                        <div className="auction-progress__item-to">
                            {record.toUser?.userName}
                            <img src={record.toUser?.avatarUrl ?? undefined} />
                        </div>
                    </div>
                    <div className="auction-progress__status-part">
                        {record.reward !== null ?
                            <div className="auction-progress__status-success">
                                {record.reward}/3
                            </div>
                            :
                            <div className="auction-progress__status-progress">
                                {!isFinished && (currentUser.id === record.participant.id || isCreator) &&
                                    <CommonButton
                                    color="success"
                                    onClick={() => {
                                        submitPassing({ eventRecordId: record.id, eventId: event.id })
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
