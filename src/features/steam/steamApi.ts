import { igroCehApi } from "root/shared/igroCehApi";

const steamApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        // every link carries a new state bound to the user, so it isn't kept
        getSteamSignInLink: build.query<GetSteamSignInLinkResponse, string>({
            query: (returnPath) => ({
                url: "/api/getSteamSignInLink",
                params: { returnPath }
            }),
            keepUnusedDataFor: 0,
        }),
        // the query of the page Steam sent the user to; the linked account comes with the current user
        linkSteam: build.mutation<SteamProfileStatus, Record<string, string>>({
            query: (parameters) => ({
                url: "/api/linkSteam",
                method: 'POST',
                body: { parameters }
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    // the profile was checked right after linking, it isn't asked of Steam twice
                    const { data } = await queryFulfilled;
                    dispatch(steamApi.util.upsertQueryData('getSteamProfileStatus', undefined, data));
                } catch {
                    // the page shows the refusal
                }
            },
        }),
        unlinkSteam: build.mutation<void, void>({
            query: () => ({
                url: "/api/unlinkSteam",
                method: 'POST'
            }),
            invalidatesTags: ['User', 'SteamProfile'],
        }),
        // Steam gives the achievements of the player only with public game details
        getSteamProfileStatus: build.query<SteamProfileStatus, void>({
            query: () => "/api/getSteamProfileStatus",
            providesTags: ['SteamProfile'],
        }),
    })
})

export type GetSteamSignInLinkResponse = {
    steamSignInLink: string
}

export type SteamProfileStatus = {
    // null when Steam didn't answer
    isGameDataPublic: boolean | null
}

export const {
    useLazyGetSteamSignInLinkQuery,
    useLinkSteamMutation,
    useUnlinkSteamMutation,
    useGetSteamProfileStatusQuery
} = steamApi;
