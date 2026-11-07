import { igroCehApi } from "root/shared/igroCehApi";

const psnApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        // only for the administrator of the site
        getPsnStatus: build.query<PsnStatusObject, void>({
            query: () => "/api/getPsnStatus",
            transformResponse: (response: GetPsnStatusResponse) => response.psnStatus,
        }),
        // gives the code without asking PSN; the code stays while it lives, even for another online id; 400 when the online id isn't in the format
        startPsnLink: build.mutation<StartPsnLinkResponse, string>({
            query: (onlineId) => ({
                url: "/api/startPsnLink",
                method: 'POST',
                body: { onlineId }
            }),
        }),
        // reads the code in the profile on PSN once in 15 minutes: 400 the profile doesn't show the code, 404 PSN has no such online id,
        // 410 the code is gone and the player starts again, 429 the check was made already, 503 PSN doesn't answer, which spends the check too
        confirmPsnLink: build.mutation<ConfirmPsnLinkResponse, void>({
            query: () => ({
                url: "/api/confirmPsnLink",
                method: 'POST'
            }),
            invalidatesTags: ['User'],
        }),
        unlinkPsn: build.mutation<void, void>({
            query: () => ({
                url: "/api/unlinkPsn",
                method: 'POST'
            }),
            invalidatesTags: ['User'],
        }),
    })
})

export type PsnStatusObject = {
    isSignInWorking: boolean
    // only a new NPSSO helps; otherwise a sign-in that doesn't work is PSN being down or the limit of the site
    isNpssoRefused: boolean
    // as PSN told it, null while it hasn't told
    npssoExpiresAt: string | null
    // it ends in less than 7 days
    isNpssoEnding: boolean
    refreshTokenExpiresAt: string | null
}

type GetPsnStatusResponse = {
    psnStatus: PsnStatusObject
}

export type StartPsnLinkResponse = {
    code: string
}

export type ConfirmPsnLinkResponse = {
    // as PSN writes it
    psnOnlineId: string
}

export const {
    useGetPsnStatusQuery,
    useStartPsnLinkMutation,
    useConfirmPsnLinkMutation,
    useUnlinkPsnMutation
} = psnApi;
