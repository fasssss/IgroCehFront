import { useEffect, useState } from "react";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import StyleIcon from '@mui/icons-material/Style';
import { CustomCard } from "root/shared/components/CustomCard";
import { CommonButton } from "root/shared/components/CommonButton";
import { EventStatus } from "root/shared/constants";
import { useRoomMessages } from "root/shared/hooks/useRoomMessages";
import {
    useMoveEventToNextStageMutation,
    useShuffleUsersMutation
} from "../../eventsApi";
import { eventRoom, EventRoomMessage } from "../../eventRoom";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

const CARD_REVEAL_DELAY_MS = 150;

const AuctionShufflingStagePage = ({ event, currentUser }: EventStageProps) => {
    const [shuffleUsers] = useShuffleUsersMutation();
    const [moveEventToNextStage] = useMoveEventToNextStageMutation();
    const records = event.eventRecords;
    const isCreator = currentUser.id === event.eventCreatorId;
    const isShuffled = records.length > 0 && records.every(record => record.toUser);
    // already shuffled cards are shown right away, every new shuffle hides them and reveals one by one
    const [revealedCount, setRevealedCount] = useState(isShuffled ? records.length : 0);

    // shuffle message reaches every participant (initiator too), so the animation runs the same for everyone
    useRoomMessages<EventRoomMessage>(eventRoom(event.id), (message) => {
        if(message.type === "shuffleUsers") {
            setRevealedCount(0);
        }
    });

    useEffect(() => {     //useEffect for sequenced animation flipping of cards
        if(!isShuffled || revealedCount >= records.length) return;

        const timeout = setTimeout(() => setRevealedCount(count => count + 1), CARD_REVEAL_DELAY_MS);
        return (() => {
            clearTimeout(timeout);
        });
    }, [isShuffled, revealedCount, records.length]);

    return(
    <div className="players-shuffle">
        <div className="players-shuffle__header">
            {
                isCreator &&
                <CommonButton
                endIcon={<StyleIcon />}
                onClick={() => shuffleUsers({ eventId: event.id })}>
                    Let's dance... I mean shuffle
                </CommonButton>
            }
            {
                isCreator &&
                <CommonButton
                endIcon={<DoubleArrowIcon />}
                onClick={() => moveEventToNextStage({ eventId: event.id, statusId: EventStatus.GuessingGames })}
                color="success"
                disabled={!isShuffled || revealedCount < records.length}>
                    Move next stage
                </CommonButton>
            }
        </div>
        <div className="players-shuffle__body">
            {
                records.map((record, index) => {
                    return(
                        <div key={record.id}  className="players-shuffle__card-container">
                            <CustomCard
                            imageUrl={ record.participant.avatarUrl ?? undefined }
                            name={ record.participant.userName }
                            isShown={index < revealedCount}
                            />
                            {
                                index < records.length - 1 &&
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
