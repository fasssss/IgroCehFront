import { igroCehApi } from "root/shared/igroCehApi";

const guildsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getSearchedGuilds: build.query<GetSearchedGuildsResponse, GetSearchedGuildsRequest>({
            query: (filter) => ({
                url: `/api/getSearchedGuilds?searchString=${filter.searchString}`,
                credentials: 'include'
            }),
        }),
        getScorsByGuild: build.query<GetScorsByGuildResponse, GetScorsByGuildRequest>({
            query: (filter) => ({
                url: `/api/getScorsByGuild?guildId=${filter.guildId}`,
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
    id: string
    name: string | null,
    iconUrl: string | null,
    ownerId: string
}

export type GetScorsByGuildRequest = {
    guildId: string
}

export type GetScorsByGuildResponse = {
    scores: Array<{
        userName: string,
        avatarUrl: string,
        score: string
    }>
}

export const { 
    useLazyGetSearchedGuildsQuery,
    useGetSearchedGuildsQuery
} = guildsApi;