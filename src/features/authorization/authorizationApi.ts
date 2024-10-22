import { igroCehApi } from "root/shared/igroCehApi";

const authorizationApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getDiscordApiLink: build.query<GetDiscordAuthLinkResponse, void>({
            query: () => "/api/getDiscordAuthLink",
        }),
        authorizeByCode: build.query<void, string>({
            query: (authCode) => ({
                url: `/api/authorizeByCode?authorizationCode=${authCode}`,
                credentials: 'include'
            }),
        })
    })
})

export type GetDiscordAuthLinkResponse = {
    discordApiLink: string
}

export const { 
    useLazyGetDiscordApiLinkQuery,
    useGetDiscordApiLinkQuery,
    useAuthorizeByCodeQuery,
} = authorizationApi;