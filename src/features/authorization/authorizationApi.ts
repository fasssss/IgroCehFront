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
        }),
        // removes HttpOnly auth cookie, which can't be done from the browser;
        // refetched user query fails with 401 and Layout redirects to the login page
        logout: build.mutation<void, void>({
            query: () => ({
                url: "/api/logout",
                method: 'POST'
            }),
            invalidatesTags: ['User'],
        })
    })
})

export type GetDiscordAuthLinkResponse = {
    discordApiLink: string
}

// the signed in user
export type UserObject = {
    userName: string,
    email: string,
    avatarUrl: string | null,
    id: string,
    // the administrator of the whole site, set by hand in the database
    isAppAdmin: boolean
}

export const {
    useGetDiscordApiLinkQuery,
    useAuthorizeByCodeMutation,
    useGetUserObjectQuery,
    useLogoutMutation
} = authorizationApi;

export const useCurrentUser = () => useGetUserObjectQuery().data;
