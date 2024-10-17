import { igroCehApi } from "root/shared/igroCehApi";

const authorizationApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getDiscordApiLink: build.query<GetDiscordAuthLinkResponse, void>({
            query: () => "/api/getDiscordAuthLink",
        }),
        postAuthorizationCode: build.mutation<void, string>({
            query: (authCode) => ({
                url: "/api/postAuthorizationCode",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    authorizationCode: authCode
                }
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
    usePostAuthorizationCodeMutation,
} = authorizationApi;