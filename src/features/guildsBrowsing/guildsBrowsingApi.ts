import { igroCehApi } from "root/shared/igroCehApi";

const guildsBrowsingApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getSearchedGuilds: build.query<GetSearchedGuildsResponse, GetSearchedGuildsRequest>({
            query: (filter) => ({
                url: `/api/getSearchedGuilds?searchString=${filter.searchString}`,
                credentials: 'include'
            }),
        })
    })
})

export type GetSearchedGuildsRequest = {
    searchString: string
}

export type GetSearchedGuildsResponse = {
    guildObjects: Array<GuildObject> | null
}

export type GuildObject = {
    id: number
    name: string | null,
    iconUrl: string | null,
    ownerId: number
}

export const { 
    useLazyGetSearchedGuildsQuery,
    useGetSearchedGuildsQuery
} = guildsBrowsingApi;