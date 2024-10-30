import { igroCehApi } from "root/shared/igroCehApi";

const eventsApi = igroCehApi.injectEndpoints({
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
        })
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

export const { 
    useLazyGetGuildByIdQuery,
    useGetGuildByIdQuery,
    usePostNewEventMutation
} = eventsApi;