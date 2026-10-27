import { igroCehApi } from "root/shared/igroCehApi";
import type { GameObject } from "root/features/events/eventsApi";

const postTo = (url: string) => <TBody>(body: TBody) => ({ url, method: 'POST', body });

// events of the whole site made by its administrator, a game of such an event is passed by a Steam achievement;
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
    })
});

// an achievement that means a game of the event is passed, in both languages of the site
export type GlobalEventAchievement = {
    apiName: string,
    name: string,
    nameRu: string,
    description: string | null,
    descriptionRu: string | null,
    iconUrl: string | null
}

export type SteamAchievement = GlobalEventAchievement & {
    // the share of the players who unlocked it, rare ones usually mean the game is passed
    percent: number | null,
    // Steam doesn't tell what to do for a hidden one
    isHidden: boolean
}

export type GlobalEventGame = {
    game: Pick<GameObject, 'id' | 'name' | 'imageUrl' | 'steamUrl'>,
    // the Steam app id, the same as the catalog id of the game
    appId: number,
    // any one of them unlocked means the game is passed
    achievements: GlobalEventAchievement[]
}

export type GlobalEvent = {
    id: string,
    name: string,
    description: string | null,
    imageUrl: string | null,
    createdAt: string,
    // null while the event is active
    finishedAt: string | null,
    games: GlobalEventGame[]
}

export type GlobalEventResponse = {
    globalEvent: GlobalEvent | null
}

export type GetSteamAchievementsResponse = {
    achievements: SteamAchievement[]
}

export type NewGlobalEventGame = {
    appId: number,
    achievementApiNames: string[]
}

export type CreateGlobalEventRequest = {
    name: string,
    description: string,
    games: NewGlobalEventGame[]
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
    useCreateGlobalEventMutation,
    useUpdateGlobalEventMutation,
    useSetGlobalEventImageMutation,
    useFinishGlobalEventMutation,
    useDeleteGlobalEventMutation
} = globalEventsApi;
