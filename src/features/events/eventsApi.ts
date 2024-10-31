import { igroCehApi } from "root/shared/igroCehApi";

const eventsApi = igroCehApi.enhanceEndpoints({
    addTagTypes: ['EventsList'],
}).injectEndpoints({
    endpoints: (build) => ({
        getGuildById: build.query<GuildObjectResponse, GetGuildByIdRequest>({
            query: (request) => ({
                url: `/api/getGuildById?guildId=${request.guildId}`,
                credentials: 'include'
            }),
        }),
        postNewEvent: build.mutation<void, PostNewEventRequest>({
            query: (request) => ({
                url: `/api/postNewEvent`,
                credentials: 'include',
                method: 'POST',
                body: {
                    guildId: request.guildId,
                    eventName: request.eventName
                }
            }),
            invalidatesTags: ['EventsList']
        }),
        getEventsByGuildId: build.query<GetEventsByGuildIdResponse, GetEventsByGuildIdRequest>({
            query: (request) => ({
                url: `/api/getEventsByGuildId?guildId=${request.guildId}`,
                credentials: 'include',
            }),
            providesTags: ['EventsList']
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

export type PostNewEventRequest = {
    guildId: string | undefined,
    eventName: string
}

export type GetEventsByGuildIdRequest = {
    guildId: string | undefined
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
    }>
}

export const { 
    useLazyGetGuildByIdQuery,
    useGetGuildByIdQuery,
    usePostNewEventMutation,
    useLazyGetEventsByGuildIdQuery,
    useGetEventsByGuildIdQuery
} = eventsApi;