import { igroCehApi } from "root/shared/igroCehApi";

const authorizationApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getDiscordApiLink: build.query<GetDiscordAuthLinkResponse, void>({
            query: () => "/api/getDiscordAuthLink",
        }),
    })
})

export type GetDiscordAuthLinkResponse = {
    discordApiLink: string
}

export const { useLazyGetDiscordApiLinkQuery, useGetDiscordApiLinkQuery } = authorizationApi;