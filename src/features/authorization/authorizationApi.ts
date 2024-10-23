import { igroCehApi } from "root/shared/igroCehApi";

const authorizationApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getDiscordApiLink: build.query<GetDiscordAuthLinkResponse, void>({
            query: () => "/api/getDiscordAuthLink",
        }),
        authorizeByCode: build.query<AuthorizeByCodeResponse, string>({
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

export type AuthorizeByCodeResponse = {
    userName: string,
    email: string,
    avatarUrl: string | null
}

export const { 
    useLazyGetDiscordApiLinkQuery,
    useGetDiscordApiLinkQuery,
    useAuthorizeByCodeQuery,
} = authorizationApi;