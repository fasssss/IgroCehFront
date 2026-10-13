import { igroCehApi } from "root/shared/igroCehApi";

const authorizationApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getDiscordApiLink: build.query<GetDiscordAuthLinkResponse, void>({
            query: () => "/api/getDiscordAuthLink",
        }),
        authorizeByCode: build.mutation<UserObject, string>({
            query: (authorizationCode) => ({
                url: "/api/authorizeByCode",
                params: { authorizationCode }
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data: user } = await queryFulfilled;
                    dispatch(authorizationApi.util.upsertQueryData('getUserObject', undefined, user));
                } catch {
                    // user stays unauthorized
                }
            },
        }),
        // single source of current user data, see useCurrentUser
        getUserObject: build.query<UserObject, void>({
            query: () => "/api/getUserObject",
            providesTags: ['User'],
        })
    })
})

export type GetDiscordAuthLinkResponse = {
    discordApiLink: string
}

export type UserObject = {
    userName: string,
    email: string,
    avatarUrl: string | null,
    id: string
}

export const {
    useGetDiscordApiLinkQuery,
    useAuthorizeByCodeMutation,
    useGetUserObjectQuery
} = authorizationApi;

export const useCurrentUser = () => useGetUserObjectQuery().data;
