import { igroCehApi } from "root/shared/igroCehApi";
import type { EventStatus } from "root/shared/constants";
import type { GameObject, UserShortObject } from "root/features/events/eventsApi";

// profile is built from the guilds shared with the current user, other players get 404
const playersApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getPlayerProfile: build.query<GetPlayerProfileResponse, GetPlayerProfileRequest>({
            query: ({ userId, guildId }) => ({
                url: '/api/getPlayerProfile',
                params: { userId, guildId }
            }),
        }),
        getPlayerHistory: build.query<GetPlayerHistoryResponse, GetPlayerHistoryRequest>({
            query: ({ userId, guildId, startFrom }) => ({
                url: '/api/getPlayerHistory',
                params: { userId, guildId, startFrom }
            }),
            // pages of one player and guild are merged into a single cache entry, the first page replaces it
            serializeQueryArgs: ({ queryArgs }) => `${queryArgs.userId}:${queryArgs.guildId ?? ''}`,
            merge: (currentCache, response, { arg }) => {
                if(arg.startFrom === 0) {
                    return response;
                }

                currentCache.historyItems.push(...response.historyItems);
                currentCache.hasMore = response.hasMore;
            },
            forceRefetch: ({ currentArg, previousArg }) => currentArg?.startFrom !== previousArg?.startFrom,
        }),
        // genres and release periods to pick preferences from
        getPreferenceTags: build.query<GetPreferenceTagsResponse, void>({
            query: () => ({ url: '/api/getPreferenceTags' }),
        }),
        // seen by the same players as the profile
        getPlayerPreferences: build.query<PlayerPreferences, string>({
            query: (userId) => ({ url: '/api/getPlayerPreferences', params: { userId } }),
        }),
        // both lists of the current user are saved on every change, the screen shows the change before the answer
        setPreferences: build.mutation<void, SetPreferencesRequest>({
            query: ({ preferred, avoided }) => ({
                url: '/api/setPreferences',
                method: 'POST',
                body: { preferredTagIds: preferred.map(tag => tag.id), avoidedTagIds: avoided.map(tag => tag.id) }
            }),
            async onQueryStarted({ userId, preferred, avoided }, { dispatch, queryFulfilled }) {
                const patch = dispatch(playersApi.util.updateQueryData('getPlayerPreferences', userId, (draft) => {
                    draft.preferred = preferred;
                    draft.avoided = avoided;
                }));
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
    })
})

export type PlayerGuildObject = {
    id: string,
    name: string,
    iconUrl: string | null,
    score: number,
    // players with equal score share the place
    place: number,
    playersCount: number,
    hasLeft: boolean
}

export type PlayerStatistics = {
    score: number,
    // unfinished events are counted too, as in the guild leaderboard
    eventsPlayed: number,
    eventsInProgress: number,
    gamesCompleted: number,
    gamesFailed: number,
    averageDaysToComplete: number | null,
    gamesSuggested: number,
    suggestedGamesCompleted: number,
    suggestedGamesFailed: number,
    rewards: Array<{ reward: number, count: number }>
}

export type PlayerProfileObject = {
    id: string,
    userName: string,
    avatarUrl: string | null,
    playingSince: string | null,
    // shared guilds where the player took part in events
    guilds: PlayerGuildObject[],
    // guilds where the player took part in events, but the current user is not a member
    otherGuildsCount: number,
    // statistics of the selected guild or of every guild of the player
    statistics: PlayerStatistics,
    // platforms of completed games from every guild of the player
    favoritePlatforms: Array<{ platform: string, count: number }>
}

export type PlayerHistoryRecord = {
    game: Pick<GameObject, 'id' | 'name' | 'imageUrl' | 'steamUrl'> | null,
    // who guessed the received game or who got the suggested one
    partner: UserShortObject | null,
    reward: number | null,
    succeededAt: string | null
}

export type PlayerHistoryItem = {
    eventId: string,
    eventName: string,
    guildId: string,
    guildName: string,
    guildIconUrl: string | null,
    statusId: EventStatus,
    startDate: string,
    endDate: string,
    receivedGame: PlayerHistoryRecord | null,
    suggestedGame: PlayerHistoryRecord | null
}

export type GetPlayerProfileRequest = {
    userId: string,
    // statistics of every guild of the player when not set
    guildId?: string
}

export type GetPlayerProfileResponse = {
    playerProfile: PlayerProfileObject
}

export type GetPlayerHistoryRequest = {
    userId: string,
    guildId?: string,
    startFrom: number
}

export type GetPlayerHistoryResponse = {
    historyItems: PlayerHistoryItem[],
    hasMore: boolean
}

// the name is shown in the language of the site, see usePreferenceTagName
export type PreferenceTag = {
    id: number,
    name: string,
    nameRu: string
}

export type GetPreferenceTagsResponse = {
    tags: PreferenceTag[]
}

// the tags in the order the player added them
export type PlayerPreferences = {
    preferred: PreferenceTag[],
    avoided: PreferenceTag[]
}

export type SetPreferencesRequest = PlayerPreferences & {
    // the lists of the current user, the id points to the cached ones
    userId: string
}

export const {
    useGetPlayerProfileQuery,
    useGetPlayerHistoryQuery,
    useGetPreferenceTagsQuery,
    useGetPlayerPreferencesQuery,
    useSetPreferencesMutation
} = playersApi;
