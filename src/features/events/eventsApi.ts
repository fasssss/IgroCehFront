import { igroCehApi } from "root/shared/igroCehApi";
import { subscribeToRoom } from "root/shared/helpers/webSocketHelper";
import { EventStatus } from "root/shared/constants";
import { applyEventRoomMessage, eventRoom, EventRoomMessage, sortByChain } from "./eventRoom";

const postTo = (url: string) => <TBody>(body: TBody) => ({ url, method: 'POST', body });

// changes made by mutations come to the opened event through its websocket room,
// refetch after mutation keeps the initiator consistent even if the socket is reconnecting
const invalidateEvent = (_result: unknown, _error: unknown, { eventId }: { eventId: string }) =>
    [{ type: 'Event' as const, id: eventId }];

const eventsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getEventById: build.query<EventObject, GetEventByIdRequest>({
            query: ({ eventId }) => ({
                url: '/api/getEventById',
                params: { eventId }
            }),
            keepUnusedDataFor: 1,
            providesTags: (_result, _error, { eventId }) => [{ type: 'Event', id: eventId }],
            transformResponse: (response: EventObject) => ({
                ...response,
                eventRecords: sortByChain(response.eventRecords)
            }),
            async onCacheEntryAdded({ eventId }, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
                try {
                    await cacheDataLoaded;
                } catch {
                    return; // cache entry was removed before the event was loaded
                }

                const unsubscribe = subscribeToRoom<EventRoomMessage>(eventRoom(eventId), {
                    onMessage: (message) => {
                        updateCachedData((draft) => applyEventRoomMessage(draft, message));
                        // the pool for newcomers is cached apart from the event, a player who leaves takes their games out of it
                        if(message.type === 'updateNewcomerPool' || message.type === 'removeUserFromEvent') {
                            dispatch(igroCehApi.util.invalidateTags([{ type: 'NewcomerPool', id: eventId }]));
                        }
                    },
                    onReconnect: () => dispatch(igroCehApi.util.invalidateTags([{ type: 'Event', id: eventId }])),
                });

                await cacheEntryRemoved;
                unsubscribe();
            },
        }),
        postNewEvent: build.mutation<PostNewEventResponse, PostNewEventRequest>({
            query: postTo('/api/postNewEvent'),
        }),
        joinEvent: build.mutation<JoinEventResponse, JoinEventRequest>({
            query: postTo('/api/joinEvent'),
            invalidatesTags: invalidateEvent,
        }),
        removeFromEvent: build.mutation<RemoveFromEventResponse, RemoveFromEventRequest>({
            query: postTo('/api/removeFromEvent'),
            invalidatesTags: invalidateEvent,
        }),
        getEventsByGuildId: build.query<GetEventsByGuildIdResponse, GetEventsByGuildIdRequest>({
            query: ({ guildId, skip }) => ({
                url: '/api/getEventsByGuildId',
                params: { guildId, startFrom: skip }
            }),
            keepUnusedDataFor: 1,
            // pages of one guild are merged into a single cache entry
            serializeQueryArgs: ({ queryArgs }) => queryArgs.guildId,
            merge: (currentCache, responseItems, { arg }) => {
                if(arg.clearCache) {
                    currentCache.eventsList = responseItems.eventsList
                }
                else {
                    currentCache.eventsList.push(...responseItems.eventsList);
                }
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg !== previousArg
            }
        }),
        moveEventToNextStage: build.mutation<MoveEventToNextStageResponse, MoveEventToNextStageRequest>({
            query: postTo('/api/moveEventToNextStage'),
            invalidatesTags: invalidateEvent,
        }),
        shuffleUsers: build.mutation<ShuffleUsersResponse, ShuffleUsersRequest>({
            query: postTo('/api/shuffleUsers'),
            invalidatesTags: invalidateEvent,
        }),
        findGameByName: build.query<FindGameByNameResponse, FindGameByNameRequest>({
            query: ({ name }) => ({
                url: '/api/findGameByName',
                params: { name }
            }),
        }),
        createGame: build.mutation<CreateGameResponse, CreateGameRequest>({
            query: ({ data }) => postTo('/api/createGame')(data),
        }),
        // search in VideoGamesCritic catalog through our API, which keeps the catalog key and caches results
        searchGames: build.query<SearchGamesResponse, SearchGamesRequest>({
            query: ({ query }) => ({
                url: '/api/searchGames',
                params: { query }
            }),
            keepUnusedDataFor: 600,
        }),
        // saves a catalog game to our database (or finds already saved one), it is suggested like any other game
        createGameFromVgc: build.mutation<CreateGameResponse, CreateGameFromVgcRequest>({
            query: postTo('/api/createGameFromVgc'),
        }),
        suggestGame: build.mutation<EventRecord, SuggestGameRequest>({
            query: postTo('/api/suggestGame'),
            invalidatesTags: invalidateEvent,
        }),
        // a passed game can be reviewed on the reviews page
        submitPassing: build.mutation<SubmitPassingResponse, SubmitPassingRequest>({
            query: postTo('/api/submitPassing'),
            invalidatesTags: (result, error, arg) => [...invalidateEvent(result, error, arg), 'ReviewLists'],
        }),
        // available to the creator once every participant has guessed a game
        activateEvent: build.mutation<void, ActivateEventRequest>({
            query: postTo('/api/activateEvent'),
            invalidatesTags: invalidateEvent,
        }),
        summarizeEvent: build.mutation<void, SummarizeEventRequest>({
            query: postTo('/api/summarizeEvent'),
            invalidatesTags: invalidateEvent,
        }),
        // available to guild admins, the event disappears from the loaded list of its guild right away
        deleteEvent: build.mutation<void, DeleteEventRequest>({
            query: ({ eventId }) => postTo('/api/deleteEvent')({ eventId }),
            async onQueryStarted({ eventId, guildId }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch {
                    return;
                }

                // pages of a guild share one cache entry, so any arguments with its id point to it
                dispatch(eventsApi.util.updateQueryData('getEventsByGuildId', { guildId, skip: 0, clearCache: false }, (draft) => {
                    draft.eventsList = draft.eventsList.filter(item => item.id !== eventId);
                }));
            },
        }),
    })
})

export type UserShortObject = {
    id: string,
    userName: string,
    avatarUrl: string | null
}

export type GameObject = {
    id: string,
    name: string,
    description: string | null,
    imageUrl: string | null,
    steamUrl: string | null,
    creatorId: string
}

export type EventRecord = {
    id: string,
    participant: UserShortObject,
    toUser: UserShortObject | null,
    game: GameObject | null,
    reward: number | null
}

export type EventObject = {
    id: string,
    eventName: string,
    eventCreatorId: string,
    statusId: EventStatus,
    // participants fill a pool of games for newcomers who join after the start
    allowsNewcomers: boolean,
    eventRecords: EventRecord[],
    // set by the event room when an admin deletes the opened event
    isDeleted?: boolean
}

export type EventShortObject = {
    id: string,
    name: string,
    creatorUserName: string,
    startDate: string,
    endDate: string,
    guildName: string,
    statusId: EventStatus,
    participantsIds: Array<string>
}

export type GetEventByIdRequest = {
    eventId: string
}

export type JoinEventRequest = {
    eventId: string
}

export type JoinEventResponse = {
    eventRecordObject: EventRecord
}

export type RemoveFromEventRequest = {
    userId: string,
    eventId: string
}

export type RemoveFromEventResponse = {
    eventRecordObject: EventRecord
}

export type PostNewEventRequest = {
    guildId: string,
    eventName: string,
    allowsNewcomers: boolean
}

export type PostNewEventResponse = {
    eventId: string
}

export type GetEventsByGuildIdRequest = {
    guildId: string,
    skip: number,
    clearCache: boolean
}

export type GetEventsByGuildIdResponse = {
    eventsList: Array<EventShortObject>
}

export type MoveEventToNextStageRequest = {
    eventId: string,
    statusId: EventStatus
}

export type MoveEventToNextStageResponse = {
    moveToStage: EventStatus
}

export type ShuffleUsersRequest = {
    eventId: string
}

export type ShuffleUsersResponse = {
    eventRecordObjects: EventRecord[]
}

export type FindGameByNameRequest = {
    name: string
}

export type FindGameByNameResponse = {
    gameObject: GameObject | null
}

export type CreateGameRequest = {
    data: FormData
}

export type CreateGameResponse = {
    gameId: string
}

export type CatalogGameObject = {
    vgcId: number,
    name: string,
    releaseDate: string | null,
    coverUrl: string | null,
    pageUrl: string,
    steamUrl: string | null,
    platforms: string[],
    criticsScore: number | null,
    playersScore: number | null
}

export type SearchGamesRequest = {
    query: string
}

export type SearchGamesResponse = {
    games: CatalogGameObject[]
}

export type CreateGameFromVgcRequest = {
    vgcId: number
}

export type SuggestGameRequest = {
    gameId: string,
    eventRecordId: string,
    eventId: string
}

export type SubmitPassingRequest = {
    eventRecordId: string,
    eventId: string
}

export type SubmitPassingResponse = {
    eventRecordObject: EventRecord,
}

export type ActivateEventRequest = {
    eventId: string
}

export type SummarizeEventRequest = {
    eventId: string
}

export type DeleteEventRequest = {
    eventId: string,
    guildId: string
}

export const {
    usePostNewEventMutation,
    useLazyGetEventsByGuildIdQuery,
    useJoinEventMutation,
    useRemoveFromEventMutation,
    useGetEventByIdQuery,
    useMoveEventToNextStageMutation,
    useShuffleUsersMutation,
    useLazyFindGameByNameQuery,
    useCreateGameMutation,
    useLazySearchGamesQuery,
    useCreateGameFromVgcMutation,
    useSuggestGameMutation,
    useSubmitPassingMutation,
    useActivateEventMutation,
    useSummarizeEventMutation,
    useDeleteEventMutation,
} = eventsApi;
