import { igroCehApi } from "root/shared/igroCehApi";

const psnApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        // only for the administrator of the site
        getPsnStatus: build.query<PsnStatusObject, void>({
            query: () => "/api/getPsnStatus",
            transformResponse: (response: GetPsnStatusResponse) => response.psnStatus,
        }),
    })
})

export type PsnStatusObject = {
    isSignInWorking: boolean
    // only a new NPSSO helps; otherwise a sign-in that doesn't work is PSN being down or the limit of the site
    isNpssoRefused: boolean
    // the day typed in the settings of the API, optional
    npssoExpiresAt: string | null
    // the day is near or has passed; it may be old, so it says nothing about the sign-in itself
    isNpssoEnding: boolean
    refreshTokenExpiresAt: string | null
}

type GetPsnStatusResponse = {
    psnStatus: PsnStatusObject
}

export const {
    useGetPsnStatusQuery
} = psnApi;
