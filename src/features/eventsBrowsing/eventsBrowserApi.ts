import { igroCehApi } from "root/shared/igroCehApi";

const eventsBrowsingApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getGuildById: build.query<GuildObjectResponse, GetGuildByIdRequest>({
            query: (request) => ({
                url: `/api/getGuildById?guildId=${request.guildId}`,
                credentials: 'include'
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

export const { 
    useLazyGetGuildByIdQuery,
    useGetGuildByIdQuery
} = eventsBrowsingApi;