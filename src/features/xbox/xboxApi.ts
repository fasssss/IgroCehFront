import { igroCehApi } from "root/shared/igroCehApi";

const xboxApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        // the page of OpenXBL that leads to the sign-in of Microsoft, the same for every user
        getXboxSignInLink: build.query<GetXboxSignInLinkResponse, void>({
            query: () => "/api/getXboxSignInLink",
        }),
        // the code the sign-in brought back; the linked account comes with the current user
        linkXbox: build.mutation<LinkXboxResponse, string>({
            query: (code) => ({
                url: "/api/linkXbox",
                method: 'POST',
                body: { code }
            }),
            invalidatesTags: ['User'],
        }),
        unlinkXbox: build.mutation<void, void>({
            query: () => ({
                url: "/api/unlinkXbox",
                method: 'POST'
            }),
            invalidatesTags: ['User'],
        }),
    })
})

export type GetXboxSignInLinkResponse = {
    xboxSignInLink: string
}

export type LinkXboxResponse = {
    xboxGamertag: string
}

export const {
    useLazyGetXboxSignInLinkQuery,
    useLinkXboxMutation,
    useUnlinkXboxMutation
} = xboxApi;
