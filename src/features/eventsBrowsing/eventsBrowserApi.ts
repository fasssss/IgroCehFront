import { igroCehApi } from "root/shared/igroCehApi";

const eventsBrowsingApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getGuildById: build.query<GuildObject, GetGuildByIdRequest>({
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

export type GuildObject = {
    id: string
    name: string | null,
    iconUrl: string | null,
    ownerId: string
}

export const { 
    useLazyGetGuildByIdQuery,
    useGetGuildByIdQuery
} = eventsBrowsingApi;