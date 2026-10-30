import { igroCehApi } from "root/shared/igroCehApi";
import type { GameObject, UserShortObject } from "root/features/events/eventsApi";
import type { ClaimPlatform, ClaimStatus, PassingCheck } from "./globalEventClaims";
import type { AchievementPlatform } from "./achievementPlatforms";

const postTo = (url: string) => <TBody>(body: TBody) => ({ url, method: 'POST', body });

// events of the whole site made by its administrator, a game of such an event is passed by a Steam or an Xbox achievement;
// every change invalidates all of them, there are few
const globalEventsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        // the banner of the main page, globalEvent is null when no event is active
        getActiveGlobalEvent: build.query<GlobalEventResponse, void>({
            query: () => '/api/getActiveGlobalEvent',
            providesTags: ['GlobalEvent'],
        }),
        getGlobalEvent: build.query<GlobalEventResponse, string>({
            query: (globalEventId) => ({ url: '/api/getGlobalEvent', params: { globalEventId } }),
            providesTags: (_result, _error, globalEventId) => [{ type: 'GlobalEvent', id: globalEventId }],
        }),
        // only for the administrator, 503 when Steam doesn't answer; the API keeps them for hours, so do we
        getSteamAchievements: build.query<GetSteamAchievementsResponse, number>({
            query: (appId) => ({ url: '/api/getSteamAchievements', params: { appId } }),
            keepUnusedDataFor: 600,
        }),
        // only for the administrator: the games of the Microsoft Store with an Xbox title id, 503 when OpenXBL doesn't answer
        searchXboxTitles: build.query<SearchXboxTitlesResponse, string>({
            query: (query) => ({ url: '/api/searchXboxTitles', params: { query } }),
            keepUnusedDataFor: 600,
        }),
        // only for the administrator: 404 when the game in Xbox has no achievements or there is no such title id
        getXboxAchievements: build.query<GetXboxAchievementsResponse, string>({
            query: (titleId) => ({ url: '/api/getXboxAchievements', params: { titleId } }),
            keepUnusedDataFor: 600,
        }),
        // 409 while another event is active, 400 when Steam or the catalog doesn't know a game or an achievement, 503 when they don't answer
        createGlobalEvent: build.mutation<GlobalEventResponse, CreateGlobalEventRequest>({
            query: postTo('/api/createGlobalEvent'),
            invalidatesTags: ['GlobalEvent'],
        }),
        // the event comes in full, the games in their new order
        updateGlobalEvent: build.mutation<GlobalEventResponse, UpdateGlobalEventRequest>({
            query: postTo('/api/updateGlobalEvent'),
            invalidatesTags: ['GlobalEvent'],
        }),
        // FormData with globalEventId and image, the image replaces the previous one
        setGlobalEventImage: build.mutation<SetGlobalEventImageResponse, { data: FormData }>({
            query: ({ data }) => postTo('/api/setGlobalEventImage')(data),
            invalidatesTags: ['GlobalEvent'],
        }),
        // after that a new event can be created
        finishGlobalEvent: build.mutation<void, GlobalEventRequest>({
            query: postTo('/api/finishGlobalEvent'),
            invalidatesTags: ['GlobalEvent'],
        }),
        deleteGlobalEvent: build.mutation<void, GlobalEventRequest>({
            query: postTo('/api/deleteGlobalEvent'),
            invalidatesTags: ['GlobalEvent'],
        }),
        // the games the current user rolled in the event, participation is null before the roll
        getGlobalEventParticipation: build.query<GlobalEventParticipationResponse, string>({
            query: (globalEventId) => ({ url: '/api/getGlobalEventParticipation', params: { globalEventId } }),
        }),
        // three games drop at once; 422 when every game has an achievement the player unlocked already, 409 when the roll is done
        rollGlobalEventGames: build.mutation<GlobalEventParticipationResponse, GlobalEventRequest>({
            query: postTo('/api/rollGlobalEventGames'),
            // the event counts its participants
            invalidatesTags: ['GlobalEvent'],
            onQueryStarted: setParticipation,
        }),
        pickGlobalEventGame: build.mutation<GlobalEventParticipationResponse, PickGlobalEventGameRequest>({
            query: postTo('/api/pickGlobalEventGame'),
            onQueryStarted: setParticipation,
        }),
        // a week after the pick the game can be refused, three new games drop at once
        refuseGlobalEventGame: build.mutation<GlobalEventParticipationResponse, GlobalEventRequest>({
            query: postTo('/api/refuseGlobalEventGame'),
            onQueryStarted: setParticipation,
        }),
        // Steam is asked about the picked game, 503 when it doesn't answer
        // the achievements of the picked game on one platform, 429 when it was checked there less than ten minutes ago
        checkGlobalEventPassing: build.mutation<CheckGlobalEventPassingResponse, CheckGlobalEventPassingRequest>({
            query: postTo('/api/checkGlobalEventPassing'),
            // the event counts the passed players
            invalidatesTags: ['GlobalEvent'],
            onQueryStarted: setParticipation,
        }),
        // one claim at a time is under review
        submitGlobalEventClaim: build.mutation<GlobalEventParticipationResponse, SubmitGlobalEventClaimRequest>({
            query: postTo('/api/submitGlobalEventClaim'),
            invalidatesTags: ['GlobalEventClaims'],
            onQueryStarted: setParticipation,
        }),
        // only for the administrators, the claims under review first
        getGlobalEventClaims: build.query<GlobalEventClaimsResponse, string>({
            query: (globalEventId) => ({ url: '/api/getGlobalEventClaims', params: { globalEventId } }),
            providesTags: ['GlobalEventClaims'],
        }),
        // 409 when another administrator has decided it already
        decideGlobalEventClaim: build.mutation<void, DecideGlobalEventClaimRequest>({
            query: postTo('/api/decideGlobalEventClaim'),
            invalidatesTags: ['GlobalEventClaims', 'GlobalEvent'],
        }),
        // only for the administrators: every badge, the oldest first, with the events that give it
        getBadges: build.query<BadgesResponse, void>({
            query: () => '/api/getBadges',
            providesTags: ['Badge', 'GlobalEvent'],
        }),
        // only for the administrators: FormData with name and image (SVG, PNG or WebP); 400 when the file isn't such an image
        // or an SVG has scripts or links outside of itself
        uploadBadge: build.mutation<UploadBadgeResponse, { data: FormData }>({
            query: ({ data }) => postTo('/api/uploadBadge')(data),
            invalidatesTags: ['Badge'],
        }),
    })
});

// the answer of a roll, a pick or a refusal is the new participation, it isn't asked for again;
// a refused request means the page shows an old one, so it is read again
async function setParticipation({ globalEventId }: GlobalEventRequest, { dispatch, queryFulfilled }: {
    dispatch: (action: unknown) => unknown,
    queryFulfilled: Promise<{ data: GlobalEventParticipationResponse }>
}) {
    try {
        const { data } = await queryFulfilled;
        dispatch(globalEventsApi.util.upsertQueryData('getGlobalEventParticipation', globalEventId, { participation: data.participation }));
    } catch {
        dispatch(globalEventsApi.endpoints.getGlobalEventParticipation.initiate(globalEventId, { subscribe: false, forceRefetch: true }));
    }
}

// an achievement that means a game of the event is passed, in both languages of the site
export type GlobalEventAchievement = {
    platform: AchievementPlatform,
    // the API name in Steam or the id in Xbox
    apiName: string,
    name: string,
    nameRu: string,
    description: string | null,
    descriptionRu: string | null,
    iconUrl: string | null
}

// an achievement as Steam or Xbox gives it to the administrator, the platform is the one asked
export type PlatformAchievement = Omit<GlobalEventAchievement, 'platform'> & {
    // the share of the players who unlocked it, rare ones usually mean the game is passed
    percent: number | null,
    // Steam doesn't tell what to do for a hidden one, Xbox tells it for a secret one
    isHidden: boolean
}

// a game in Xbox, its achievements are kept by its title id
export type XboxTitle = {
    titleId: string,
    name: string,
    // the box art of the store
    imageUrl: string | null
}

export type GlobalEventGame = {
    game: Pick<GameObject, 'id' | 'name' | 'imageUrl' | 'steamUrl'>,
    // the catalog id of the game, its Steam app id when the game is in Steam
    appId: number,
    // the game in Xbox the Xbox achievements belong to, null without them
    xboxTitleId: string | null,
    xboxTitleName: string | null,
    // any one of them unlocked means the game is passed; the Steam ones first
    achievements: GlobalEventAchievement[]
}

export type GlobalEvent = {
    id: string,
    name: string,
    description: string | null,
    imageUrl: string | null,
    // the badge a player gets for passing the event, its image is badgeImageUrl; null for the events made before the badges
    badgeId: string | null,
    createdAt: string,
    // null while the event is active
    finishedAt: string | null,
    // the players who rolled its games; with any of them the games can't change
    participantCount: number,
    // the participants who passed their picked game
    passedCount: number,
    games: GlobalEventGame[]
}

// the roll of the current user in a global event, games by their catalog ids
export type GlobalEventParticipation = {
    // in the order they dropped, up to three
    rolledAppIds: number[],
    rolledAt: string,
    // null until the player picks one of the rolled games
    pickedAppId: number | null,
    pickedAt: string | null,
    // from then on the picked game can be refused for a new roll
    refusableAt: string | null,
    // the picked game is passed, the participation is over
    passedAt: string | null,
    // the platform whose achievement passed the game, null for a claim and for the Steam passings made before Xbox
    passedPlatform: AchievementPlatform | null,
    // the last check of the passing on a platform and from when the next one is allowed, null before the first check
    steamCheckedAt: string | null,
    steamCheckableAt: string | null,
    xboxCheckedAt: string | null,
    xboxCheckableAt: string | null,
    // the last claim for the picked game
    claim: GlobalEventClaim | null
}

export type GlobalEventParticipationResponse = {
    participation: GlobalEventParticipation | null
}

// a claim that the picked game is passed, with the profile that shows it
export type GlobalEventClaim = {
    id: string,
    // null in the participation of the player themselves
    player: UserShortObject | null,
    // the catalog id of the game the claim is about
    appId: number,
    platform: ClaimPlatform,
    profile: string,
    status: ClaimStatus,
    // the reason of a rejection
    comment: string | null,
    createdAt: string,
    decidedAt: string | null,
    // null while it is under review and for the player themselves
    decidedBy: UserShortObject | null
}

export type CheckGlobalEventPassingRequest = GlobalEventRequest & {
    platform: AchievementPlatform
}

export type CheckGlobalEventPassingResponse = GlobalEventParticipationResponse & {
    passingCheck: PassingCheck
}

export type SubmitGlobalEventClaimRequest = GlobalEventRequest & {
    platform: ClaimPlatform,
    profile: string
}

export type GlobalEventClaimsResponse = {
    claims: GlobalEventClaim[]
}

export type DecideGlobalEventClaimRequest = {
    claimId: string,
    isApproved: boolean,
    // the reason of a rejection, may be empty
    comment?: string
}

export type PickGlobalEventGameRequest = GlobalEventRequest & {
    appId: number
}

export type GlobalEventResponse = {
    globalEvent: GlobalEvent | null
}

export type GetSteamAchievementsResponse = {
    achievements: PlatformAchievement[]
}

export type SearchXboxTitlesResponse = {
    titles: XboxTitle[]
}

export type GetXboxAchievementsResponse = {
    title: Pick<XboxTitle, 'titleId' | 'name'>,
    achievements: PlatformAchievement[]
}

export type NewGlobalEventGame = {
    appId: number,
    // in Steam
    achievementApiNames: string[],
    // the game in Xbox, needed only with Xbox achievements
    xboxTitleId: string | null,
    xboxAchievementIds: string[]
}

export type CreateGlobalEventRequest = {
    name: string,
    description: string,
    badgeId: string,
    games: NewGlobalEventGame[]
}

// a global event that gives a badge for its passing
export type GlobalEventBadgeUse = {
    badgeId: string,
    globalEventId: string,
    globalEventName: string,
    // the players who got the badge for this event
    passedCount: number
}

// a badge the administrator uploaded, its image never changes
export type Badge = {
    id: string,
    name: string,
    createdAt: string | null,
    // the latest first
    uses: GlobalEventBadgeUse[]
}

export type BadgesResponse = {
    badges: Badge[]
}

export type UploadBadgeResponse = {
    badge: Badge
}

export type UpdateGlobalEventRequest = CreateGlobalEventRequest & {
    globalEventId: string
}

export type SetGlobalEventImageResponse = {
    imageUrl: string
}

export type GlobalEventRequest = {
    globalEventId: string
}

export const {
    useGetActiveGlobalEventQuery,
    useGetGlobalEventQuery,
    useGetSteamAchievementsQuery,
    useSearchXboxTitlesQuery,
    useGetXboxAchievementsQuery,
    useCreateGlobalEventMutation,
    useUpdateGlobalEventMutation,
    useSetGlobalEventImageMutation,
    useFinishGlobalEventMutation,
    useDeleteGlobalEventMutation,
    useGetGlobalEventParticipationQuery,
    useRollGlobalEventGamesMutation,
    usePickGlobalEventGameMutation,
    useRefuseGlobalEventGameMutation,
    useCheckGlobalEventPassingMutation,
    useSubmitGlobalEventClaimMutation,
    useGetGlobalEventClaimsQuery,
    useDecideGlobalEventClaimMutation,
    useGetBadgesQuery,
    useUploadBadgeMutation
} = globalEventsApi;
