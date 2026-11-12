import { igroCehApi } from "root/shared/igroCehApi";
import type { EventStatus } from "root/shared/constants";
import type { GameObject, UserShortObject } from "root/features/events/eventsApi";
import type { AchievementPlatform } from "root/features/globalEvents/achievementPlatforms";

// the last of the queued saves of the liked aspects, see setLikedAspects
let likedAspectsSaves: Promise<void> = Promise.resolve();

// profile is built from the guilds shared with the current user, other players get 404
const playersApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getPlayerProfile: build.query<GetPlayerProfileResponse, GetPlayerProfileRequest>({
            query: ({ userId }) => ({
                url: '/api/getPlayerProfile',
                params: { userId }
            }),
        }),
        getPlayerHistory: build.query<GetPlayerHistoryResponse, GetPlayerHistoryRequest>({
            query: ({ userId, startFrom }) => ({
                url: '/api/getPlayerHistory',
                params: { userId, startFrom }
            }),
            // pages of one player are merged into a single cache entry, the first page replaces it
            serializeQueryArgs: ({ queryArgs }) => queryArgs.userId,
            merge: (currentCache, response, { arg }) => {
                if(arg.startFrom === 0) {
                    return response;
                }

                currentCache.historyItems.push(...response.historyItems);
                currentCache.hasMore = response.hasMore;
            },
            forceRefetch: ({ currentArg, previousArg }) => currentArg?.startFrom !== previousArg?.startFrom,
        }),
        // the passed or the guessed games of the tab "Мои игры", 6 a page; the pages of one list are merged like the history,
        // a new sort starts it over
        getPlayerGames: build.query<GetPlayerGamesResponse, GetPlayerGamesRequest>({
            query: ({ userId, kind, sort, startFrom }) => ({ url: '/api/getPlayerGames', params: { userId, kind, sort, startFrom } }),
            serializeQueryArgs: ({ queryArgs }) => `${queryArgs.userId}:${queryArgs.kind}:${queryArgs.sort}`,
            merge: (currentCache, response, { arg }) => {
                if(arg.startFrom === 0) {
                    return response;
                }

                currentCache.games.push(...response.games);
                currentCache.hasMore = response.hasMore;
            },
            forceRefetch: ({ currentArg, previousArg }) => currentArg?.startFrom !== previousArg?.startFrom,
        }),
        // the Igrofest games of the player for the ladder tab, seen by the same players as the profile
        getPlayerLadder: build.query<GetPlayerLadderResponse, string>({
            query: (userId) => ({ url: '/api/getPlayerLadder', params: { userId } }),
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
        // the aspects of games a player picks what they like from
        getGameAspects: build.query<GetGameAspectsResponse, void>({
            query: () => ({ url: '/api/getGameAspects' }),
        }),
        // the whole list of the current user is saved on every change, the screen shows the change before the answer;
        // the saves go one after another, since two at once race on the server and the earlier list may win
        setLikedAspects: build.mutation<void, SetLikedAspectsRequest>({
            queryFn: async ({ likedAspects }, _api, _extraOptions, baseQuery) => {
                const previous = likedAspectsSaves;
                let finish = () => {};
                likedAspectsSaves = new Promise<void>(resolve => { finish = resolve; });
                await previous;
                try {
                    const result = await baseQuery({
                        url: '/api/setLikedAspects',
                        method: 'POST',
                        body: { aspectIds: likedAspects.map(aspect => aspect.id) }
                    });
                    return result.error ? { error: result.error } : { data: undefined };
                } finally {
                    finish();
                }
            },
            async onQueryStarted({ userId, likedAspects }, { dispatch, queryFulfilled }) {
                dispatch(playersApi.util.updateQueryData('getPlayerPreferences', userId, (draft) => {
                    draft.likedAspects = likedAspects;
                }));
                try {
                    await queryFulfilled;
                } catch {
                    // the later changes are on the screen too, so it takes the saved list once the queued saves end
                    await likedAspectsSaves;
                    dispatch(playersApi.endpoints.getPlayerPreferences.initiate(userId, { subscribe: false, forceRefetch: true }));
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

// a badge a player got for passing a global event
export type PlayerBadge = {
    // its image is badgeImageUrl of globalEvents/badges.ts
    badgeId: string,
    globalEventId: string,
    globalEventName: string,
    passedAt: string
}

export type PlayerProfileObject = {
    id: string,
    userName: string,
    avatarUrl: string | null,
    playingSince: string | null,
    // the linked Steam account
    steamId: string | null,
    // the gamertag of the linked Xbox account
    xboxGamertag: string | null,
    // the online id of the linked PSN account
    psnOnlineId: string | null,
    // shared guilds where the player took part in events
    guilds: PlayerGuildObject[],
    // guilds where the player took part in events, but the current user is not a member
    otherGuildsCount: number,
    // statistics of the selected guild or of every guild of the player
    statistics: PlayerStatistics,
    // platforms of completed games from every guild of the player
    favoritePlatforms: Array<{ platform: string, count: number }>,
    // the badges of the passed global events, the latest first; they don't depend on the guilds
    badges: PlayerBadge[]
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
    suggestedGame: PlayerHistoryRecord | null,
    // the player joined the active event and rolled a game of the pool, so they guessed nothing
    isNewcomer: boolean
}

export type GetPlayerProfileRequest = {
    userId: string
}

export type GetPlayerProfileResponse = {
    playerProfile: PlayerProfileObject
}

export type GetPlayerHistoryRequest = {
    userId: string,
    startFrom: number
}

export type GetPlayerHistoryResponse = {
    historyItems: PlayerHistoryItem[],
    hasMore: boolean
}

// mirrors Application.Enum.PlayerGamesKind / PlayerGamesSort on backend
export const PlayerGamesKind = { Passed: 0, Guessed: 1 } as const;
export type PlayerGamesKind = typeof PlayerGamesKind[keyof typeof PlayerGamesKind];
export const PlayerGamesSort = { Latest: 0, Score: 1 } as const;
export type PlayerGamesSort = typeof PlayerGamesSort[keyof typeof PlayerGamesSort];

// a game of the tab "Мои игры": passed by the player or guessed by them
export type PlayerGame = {
    eventRecordId: string,
    game: Pick<GameObject, 'id' | 'name' | 'imageUrl' | 'steamUrl'>,
    // who guessed a passed game or who got a guessed one
    partner: UserShortObject | null,
    eventId: string,
    eventName: string,
    // the time of the passing or of the guess
    date: string | null,
    // the review of a passed game and its score, when the viewer may read it
    reviewId: string | null,
    score: number | null
}

export type GetPlayerGamesRequest = {
    userId: string,
    kind: PlayerGamesKind,
    sort: PlayerGamesSort,
    startFrom: number
}

export type GetPlayerGamesResponse = {
    games: PlayerGame[],
    hasMore: boolean
}

// a game of the Igrofest (a global event) the player picked
export type PlayerFestGame = {
    game: Pick<GameObject, 'id' | 'name' | 'imageUrl' | 'steamUrl'>,
    globalEventId: string,
    globalEventName: string,
    pickedAt: string | null,
    passedAt: string | null,
    // the platform of the automatic check, null for a passing confirmed by an administrator
    passedPlatform: AchievementPlatform | null
}

export type GetPlayerLadderResponse = {
    fest: {
        // the picked and not yet passed game of the active global event
        current: PlayerFestGame | null,
        // the latest first
        passed: PlayerFestGame[]
    }
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

// an aspect of games such as the story or the music, the name is shown in the language of the site
export type GameAspect = {
    id: number,
    name: string,
    nameRu: string
}

export type GetGameAspectsResponse = {
    aspects: GameAspect[]
}

// the tags and the aspects in the order the player added them
export type PlayerPreferences = {
    preferred: PreferenceTag[],
    avoided: PreferenceTag[],
    // "What I like in games"
    likedAspects: GameAspect[]
}

export type SetPreferencesRequest = Pick<PlayerPreferences, 'preferred' | 'avoided'> & {
    // the lists of the current user, the id points to the cached ones
    userId: string
}

export type SetLikedAspectsRequest = Pick<PlayerPreferences, 'likedAspects'> & {
    // the current user, the id points to the cached preferences
    userId: string
}

export const {
    useGetPlayerProfileQuery,
    useGetPlayerHistoryQuery,
    useGetPlayerLadderQuery,
    useGetPlayerGamesQuery,
    useGetPreferenceTagsQuery,
    useGetPlayerPreferencesQuery,
    useSetPreferencesMutation,
    useGetGameAspectsQuery,
    useSetLikedAspectsMutation
} = playersApi;
