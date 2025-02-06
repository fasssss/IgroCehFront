import { igroCehApi } from "root/shared/igroCehApi";
import { addRoom, /*leaveRoom,*/ WebSocketMessage } from "root/shared/helpers/webSocketHelper";

const eventsApi = igroCehApi.enhanceEndpoints({
}).injectEndpoints({
    endpoints: (build) => ({
        getGuildById: build.query<GuildObjectResponse, GetGuildByIdRequest>({
            query: (request) => ({
                url: `/api/getGuildById?guildId=${request.guildId}`,
                credentials: 'include'
            }),
        }),
        getEventById: build.query<EventObjectResponse, GetEventByIdRequest>({
            query: (request) => ({
                url: `/api/getEventById?eventId=${request.eventId}`,
                credentials: 'include'
            }),
            keepUnusedDataFor: 1,
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const listener = (event: MessageEvent) => {
                    const data: WebSocketMessage<EventRecord> = JSON.parse(event.data)
                    if(data.type === "addUserToEvent") {
                        updateCachedData((draft) => {
                            draft.eventRecords.push(data.payload);
                        });
                    }

                    if(data.type === "removeUserFromEvent") {
                        updateCachedData((draft) => {
                            draft.eventRecords = draft.eventRecords
                            .filter(item => item.id !== data.payload.id);
                        });
                    }

                    if(data.type === "suggestGame") {
                        updateCachedData((draft) => {
                            const eventRecordIndex = draft.eventRecords.findIndex(item => item.id === data.payload.id);
                            draft.eventRecords[eventRecordIndex].game = data.payload.game;
                        });
                    }
                };

                try {
                    //ensureConnection()
                    await cacheDataLoaded
                    await addRoom(`event${arg.eventId}` || "", listener)

                    await cacheEntryRemoved
                    //await leaveRoom(`event${arg.eventId}` || "", listener);
                } catch(e) {
                    console.log(e);
                }
            },
            transformResponse: (response: EventObjectResponse) => {
                for (let i = 0; i < response.eventRecords.length - 1; i++) {  // sorting users in order of "from who" -> "to"
                    if(!response.eventRecords[i].toUser) {
                        break;
                    }

                    const toUserIndex = response.eventRecords.findIndex(item => item.participant.id === response.eventRecords[i].toUser?.id);
                    const temp: EventRecord = {...response.eventRecords[i + 1]};
                    response.eventRecords[i + 1] = response.eventRecords[toUserIndex];
                    response.eventRecords[toUserIndex] = temp;
                }
                
                return response;
            }
        }),
        postNewEvent: build.mutation<PostNewEventResponse, PostNewEventRequest>({
            query: (request) => ({
                url: `/api/postNewEvent`,
                credentials: 'include',
                method: 'POST',
                body: {
                    guildId: request.guildId,
                    eventName: request.eventName
                }
            })
        }),
        joinEvent: build.mutation<JoinEventResponse, JoinEventRequest>({
            query: (request) => ({
                url: `/api/joinEvent`,
                credentials: 'include',
                method: 'POST',
                body: {
                    eventId: request.eventId
                }
            }),
            async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
                try {
                  const { data: newEventRecord } = await queryFulfilled
                  dispatch(
                    eventsApi.util.updateQueryData('getEventById', { eventId }, (draft) => {
                      draft.eventRecords.push(newEventRecord.eventRecordObject)
                    })
                  )
                } catch {}
              },
        }),
        removeFromEvent: build.mutation<RemoveFromEventResponse, RemoveFromEventRequest>({
            query: (request) => ({
                url: `/api/removeFromEvent`,
                credentials: 'include',
                method: 'POST',
                body: {
                    userId: request.userId,
                    eventId: request.eventId
                }
            }),
            async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
                try {
                  const { data: removedEventRecordData } = await queryFulfilled
                  dispatch(
                    eventsApi.util.updateQueryData('getEventById', { eventId }, (draft) => {
                      draft.eventRecords = draft.eventRecords
                      .filter(item => item.id !== removedEventRecordData.eventRecordObject.id);
                    })
                  )
                } catch {}
              },
        }),
        getEventsByGuildId: build.query<GetEventsByGuildIdResponse, GetEventsByGuildIdRequest>({
            query: (request) => ({
                url: `/api/getEventsByGuildId?guildId=${request.guildId}&startFrom=${request.skip}`,
                credentials: 'include',
            }),
            keepUnusedDataFor: 1,
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName
            },
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
        moveEventToNextStage: build.mutation<void, MoveEventToNextStageRequest>({
            query: (request) => ({
                url: `/api/moveEventToNextStage`,
                credentials: 'include',
                method: 'POST',
                body: {
                    eventId: request.eventId,
                    statusId: request.statusId
                }
            }),
        }),
        shuffleUsers: build.mutation<ShuffleUsersResponse, ShuffleUsersRequest>({
            query: (request) => ({
                url: `/api/shuffleUsers`,
                credentials: 'include',
                method: 'POST',
                body: {
                    eventId: request.eventId
                }
            }),
            async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
                try {
                  const { data: shuffledEventRecordData } = await queryFulfilled
                  dispatch(
                    eventsApi.util.updateQueryData('getEventById', { eventId }, (draft) => {
                      draft.eventRecords = shuffledEventRecordData.eventRecordObjects
                    })
                  )
                } catch {}
              },
        }),
        findGameByName: build.query<FindGameByNameResponse, FindGameByNameRequest>({
            query: (request) => ({
                url: `/api/findGameByName?name=${request.name}`,
                credentials: 'include',
                method: 'GET'
            }),
        }),
        createGame: build.mutation<CreateGameResponse, CreateGameRequest>({
            query: (request) => ({
                url: `/api/createGame`,
                credentials: 'include',
                method: 'POST',
                body: request.data,
            }),
        }),
        suggestGame: build.mutation<SuggestGameResponse, SuggestGameRequest>({
            query: (request) => ({
                url: `/api/suggestGame`,
                credentials: 'include',
                method: 'POST',
                body: {
                    gameId: request.gameId,
                    eventRecordId: request.eventRecordId,
                    eventId: request.eventId
                }
            }),
            async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
                try {
                  const { data: suggestGameResponse } = await queryFulfilled
                  dispatch(
                    eventsApi.util.updateQueryData('getEventById', { eventId }, (draft) => {
                        const eventRecordIndex = draft.eventRecords.findIndex(item => item.id === suggestGameResponse.eventRecordObject.id)
                        draft.eventRecords[eventRecordIndex].game = suggestGameResponse.eventRecordObject.game;
                    })
                  )
                } catch {}
              },
        }),
        submitPassing: build.mutation<SubmitPassingResponse, SubmitPassingRequest>({
            query: (request) => ({
                url: `/api/submitPassing`,
                credentials: 'include',
                method: 'POST',
                body: {
                    eventRecordId: request.eventRecordId
                }
            }),
            async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
                try {
                  const { data: submitPassingResponse } = await queryFulfilled
                  dispatch(
                    eventsApi.util.updateQueryData('getEventById', { eventId }, (draft) => {
                        const eventRecordIndex = draft.eventRecords.findIndex(item => item.id === submitPassingResponse.eventRecordObject.id)
                        draft.eventRecords[eventRecordIndex].reward = submitPassingResponse.eventRecordObject.reward;
                    })
                  )
                } catch {}
            },
        }),

        summarizeEvent: build.mutation<SummarizeEventResponse, SummarizeEventRequest>({
            query: (request) => ({
                url: `/api/summarizeEvent`,
                credentials: 'include',
                method: 'POST',
                body: {
                    eventId: request.eventId
                }
            }),
        }),
    })
})

export type GetGuildByIdRequest = {
    guildId: string | undefined
}

export type GuildObjectResponse = {
    guildObject: {
        id: string
        name: string | null,
        iconUrl: string | undefined,
        ownerId: string
    }
}

export type GetEventByIdRequest = {
    eventId: string | undefined
}

export type EventObjectResponse = {
    Id: string,
    eventName: string,
    eventCreatorId: string,
    statusId: number,
    eventRecords: EventRecord[]
}

type EventRecord = {
    id: string,
    participant: {
        id: string,
        userName: string,
        avatarUrl: string | undefined
    },
    toUser: {
        id: string,
        userName: string,
        avatarUrl: string | undefined
    } | undefined,
    game: {
        id: string,
        name: string,
        description: string | undefined,
        imageUrl: string | undefined,
        steamUrl: string | undefined
    } | undefined,
    reward: number | null
}

type JoinEventResponse = {
    eventRecordObject: EventRecord
}

type RemoveFromEventRequest = {
    userId: string,
    eventId: string
}

type RemoveFromEventResponse = {
    eventRecordObject: EventRecord
}

export type PostNewEventRequest = {
    guildId: string | undefined,
    eventName: string
}

export type PostNewEventResponse = {
    eventId: string
}

export type GetEventsByGuildIdRequest = {
    guildId: string | undefined,
    skip: number,
    clearCache: boolean
}

export type GetEventsByGuildIdResponse = {
    eventsList: Array<{
        id: string,
        name: string,
        creatorUserName: string,
        startDate: Date,
        endDate: Date,
        guildName: string,
        statusId: number,
        participantsIds: Array<string>
    }>
}

export type JoinEventRequest = {
    eventId: string,
}

export type MoveEventToNextStageRequest = {
    eventId: string,
    statusId: number
}

export type MoveEventToNextStageResponse = {
    moveToStage: number
}

export type ShuffleUsersRequest = {
    eventId: string | undefined
}

export type ShuffleUsersResponse = {
    eventRecordObjects: EventRecord[]
}

export type FindGameByNameRequest = {
    name: string
}

export type FindGameByNameResponse = {
    gameObject: {
        id: string,
        name: string,
        description: string | null,
        imageUrl: string | null,
        steamUrl: string | null,
        creatorId: string
    } | null
}

export type CreateGameRequest = {
    data: FormData
}

export type CreateGameResponse = {
    gameId: string
}

export type SuggestGameRequest = {
    gameId: string,
    eventRecordId: string,
    eventId: string
}

export type SuggestGameResponse = {
    eventRecordObject: EventRecord
}

export type SubmitPassingRequest = {
    eventRecordId: string,
    eventId: string
}

export type SubmitPassingResponse = {
    eventRecordObject: EventRecord,
}

export type SummarizeEventRequest = {
    eventId: string
}

export type SummarizeEventResponse = {

}

export const { 
    useLazyGetGuildByIdQuery,
    useGetGuildByIdQuery,
    usePostNewEventMutation,
    useLazyGetEventsByGuildIdQuery,
    useGetEventsByGuildIdQuery,
    useJoinEventMutation,
    useRemoveFromEventMutation,
    useLazyGetEventByIdQuery,
    useGetEventByIdQuery,
    useMoveEventToNextStageMutation,
    useShuffleUsersMutation,
    useFindGameByNameQuery,
    useLazyFindGameByNameQuery,
    useCreateGameMutation,
    useSuggestGameMutation,
    useSubmitPassingMutation,
    useSummarizeEventMutation,
} = eventsApi;