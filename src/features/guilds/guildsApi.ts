import { igroCehApi } from "root/shared/igroCehApi";

const guildsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getSearchedGuilds: build.query<GetSearchedGuildsResponse, GetSearchedGuildsRequest>({
            query: (filter) => ({
                url: `/api/getSearchedGuilds?searchString=${filter.searchString}`,
                credentials: 'include'
            }),
        }),
        getScoresByGuild: build.query<GetScoresByGuildResponse, GetScoresByGuildRequest>({
            query: (filter) => ({
                url: `/api/getScoresByGuild?guildId=${filter.guildId}`,
                credentials: 'include'
            }),
        }),
        getGuildById: build.query<GuildObjectResponse, GetGuildByIdRequest>({
            query: (request) => ({
                url: `/api/getGuildById?guildId=${request.guildId}`,
                credentials: 'include'
            }),
        }),
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

export type GetScoresByGuildRequest = {
    guildId: string
}

export type GetScoresByGuildResponse = {
    scores: Array<{
        userId: string,
        userName: string,
        avatarUrl: string,
        score: number,
        eventsPlayed: number
    }>
}

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
    useLazyGetSearchedGuildsQuery,
    useGetSearchedGuildsQuery,
    useGetScoresByGuildQuery,
    useGetGuildByIdQuery
} = guildsApi;