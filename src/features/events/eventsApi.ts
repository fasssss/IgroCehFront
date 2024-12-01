import { igroCehApi } from "root/shared/igroCehApi";
import { addRoom, ensureConnection, leaveRoom, WebSocketMessage } from "root/shared/helpers/webSocketHelper";

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
                };

                try {
                    ensureConnection()
                    await cacheDataLoaded
                    await addRoom(`event${arg.eventId}` || "", listener)

                    await cacheEntryRemoved
                    await leaveRoom(`event${arg.eventId}` || "", listener);
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
                    eventId: request.eventId
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
        avatarUrl: string | undefined,
        steamUrl: string | undefined
    } | undefined
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
    eventId: string
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
    useShuffleUsersMutation
} = eventsApi;