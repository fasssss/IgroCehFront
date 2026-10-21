import { ComponentType } from "react";
import { Navigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { EventStatus } from "root/shared/constants";
import { useCurrentUser, UserObject } from "root/features/authorization/authorizationApi";
import { EventObject, useGetEventByIdQuery } from "../../eventsApi";
import { EventPage } from "../EventPage";
import { AuctionShufflingStagePage } from "../AuctionShufflingStagePage";
import { GameGuessPage } from "../GameGuessPage";
import { AuctionProgressPage } from "../AuctionProgressPage";
import { GUESS_GAME_SUBPATH } from "../../guessGamePath";
import './styles.scss';

export type EventStageProps = {
    event: EventObject,
    currentUser: UserObject
}

const getStagePage = (event: EventObject, currentUserId: string): ComponentType<EventStageProps> => {
    switch (event.statusId) {
        case EventStatus.PlayersRegistration:
            return EventPage;
        case EventStatus.PlayersShuffle:
            return AuctionShufflingStagePage;
        case EventStatus.GuessingGames: {
            // participant guesses until the game is suggested, everyone else watches the progress
            const ownRecord = event.eventRecords.find(record => record.participant.id === currentUserId);
            return ownRecord && !ownRecord.game ? GameGuessPage : AuctionProgressPage;
        }
        default:
            return AuctionProgressPage;
    }
};

// Event is loaded once here and kept up to date through its websocket room,
// so the shown stage follows status changes for every participant at the same time
const EventStageRouter = () => {
    const { guildId, eventId, '*': subPath } = useParams();
    const currentUser = useCurrentUser();
    const getEventById = useGetEventByIdQuery(eventId ? { eventId } : skipToken);

    if((getEventById.isError && !getEventById.data) || getEventById.data?.isDeleted) {
        return <Navigate to={`/guild/${guildId}`} replace />;
    }

    if(!getEventById.data || !currentUser) {
        return(
            <div className="event-stage-router__loader">
                <CircularProgress color="primary" />
            </div>
        );
    }

    if(subPath === GUESS_GAME_SUBPATH) {
        // the participant changes the guessed game until the creator activates the event, then everyone sees the progress
        const ownRecord = getEventById.data.eventRecords.find(record => record.participant.id === currentUser.id);
        return getEventById.data.statusId === EventStatus.GuessingGames && ownRecord
            ? <GameGuessPage event={getEventById.data} currentUser={currentUser} />
            : <Navigate to={`/guild/${guildId}/event/${eventId}`} replace />;
    }

    const StagePage = getStagePage(getEventById.data, currentUser.id);
    return <StagePage event={getEventById.data} currentUser={currentUser} />;
}

export { EventStageRouter }
