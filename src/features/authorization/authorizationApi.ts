import { igroCehApi } from "root/shared/igroCehApi";

const authorizationApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getDiscordApiLink: build.query<GetDiscordAuthLinkResponse, void>({
            query: () => "/api/getDiscordAuthLink",
        }),
        authorizeByCode: build.query<GetUserObjectResponse, string>({
            query: (authCode) => ({
                url: `/api/authorizeByCode?authorizationCode=${authCode}`,
                credentials: 'include'
            }),
        }),
        getIsAuthorized: build.query<boolean, void>({
            query: () => ({
                url: `/api/getIsAuthorized`,
                credentials: 'include'
            }),
        }),
        getUserObject: build.query<GetUserObjectResponse, void>({
            query: () => ({
                url: `/api/getUserObject`,
                credentials: 'include'
            }),
        })
    })
})

export type GetDiscordAuthLinkResponse = {
    discordApiLink: string
}

export type GetUserObjectResponse = {
    userName: string,
    email: string,
    avatarUrl: string | null,
    id: string | null
}

export const { 
    useLazyGetDiscordApiLinkQuery,
    useGetDiscordApiLinkQuery,
    useLazyAuthorizeByCodeQuery,
    useAuthorizeByCodeQuery,
    useGetIsAuthorizedQuery,
    useLazyGetUserObjectQuery,
    useGetUserObjectQuery
} = authorizationApi;