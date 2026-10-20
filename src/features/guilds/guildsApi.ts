import { igroCehApi } from "root/shared/igroCehApi";

const guildsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getSearchedGuilds: build.query<GetSearchedGuildsResponse, GetSearchedGuildsRequest>({
            query: ({ searchString }) => ({
                url: '/api/getSearchedGuilds',
                params: { searchString }
            }),
        }),
        getScoresByGuild: build.query<GetScoresByGuildResponse, GetScoresByGuildRequest>({
            query: ({ guildId }) => ({
                url: '/api/getScoresByGuild',
                params: { guildId }
            }),
        }),
        // guilds where the current user took part in events, the latest played first
        getPlayedGuilds: build.query<GetPlayedGuildsResponse, void>({
            query: () => '/api/getPlayedGuilds',
        }),
        getGuildById: build.query<GetGuildByIdResponse, GetGuildByIdRequest>({
            query: ({ guildId }) => ({
                url: '/api/getGuildById',
                params: { guildId }
            }),
        }),
    })
})

export type GuildObject = {
    id: string
    name: string | null,
    iconUrl: string | null,
    ownerId: string
}

export type GetSearchedGuildsRequest = {
    searchString: string
}

export type GetSearchedGuildsResponse = {
    guildObjects: Array<GuildObject> | null
}

export type GetScoresByGuildRequest = {
    guildId: string
}

export type GetScoresByGuildResponse = {
    scores: Array<{
        userId: string,
        userName: string,
        avatarUrl: string | null,
        score: number,
        eventsPlayed: number
    }> | undefined
}

export type PlayedGuildObject = {
    id: string,
    name: string,
    iconUrl: string | null,
    eventsPlayed: number,
    eventsInProgress: number
}

export type GetPlayedGuildsResponse = {
    guilds: PlayedGuildObject[]
}

export type GetGuildByIdRequest = {
    guildId: string
}

export type GetGuildByIdResponse = {
    guildObject: GuildObject
}

export const {
    useLazyGetSearchedGuildsQuery,
    useGetScoresByGuildQuery,
    useGetPlayedGuildsQuery,
    useGetGuildByIdQuery
} = guildsApi;
