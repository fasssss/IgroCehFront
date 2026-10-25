import { igroCehApi } from "root/shared/igroCehApi";
import type { GameObject } from "./eventsApi";

const postTo = (url: string) => <TBody>(body: TBody) => ({ url, method: 'POST', body });

// every change of the pool comes to the opened event through its websocket room as well,
// the event page refetches the pool on it
const invalidatePool = (_result: unknown, _error: unknown, { eventId }: { eventId: string }) =>
    [{ type: 'NewcomerPool' as const, id: eventId }];

// participants fill the pool during the registration, newcomers roll a game from it after the start
const newcomerPoolApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getNewcomerPool: build.query<NewcomerPool, string>({
            query: (eventId) => ({ url: '/api/getNewcomerPool', params: { eventId } }),
            providesTags: (_result, _error, eventId) => [{ type: 'NewcomerPool', id: eventId }],
        }),
        addNewcomerPoolGame: build.mutation<ChangeNewcomerPoolResponse, AddNewcomerPoolGameRequest>({
            query: postTo('/api/addNewcomerPoolGame'),
            invalidatesTags: invalidatePool,
        }),
        // 409 when the game has dropped to a newcomer already
        replaceNewcomerPoolGame: build.mutation<ChangeNewcomerPoolResponse, ReplaceNewcomerPoolGameRequest>({
            query: postTo('/api/replaceNewcomerPoolGame'),
            invalidatesTags: invalidatePool,
        }),
        removeNewcomerPoolGame: build.mutation<void, RemoveNewcomerPoolGameRequest>({
            query: postTo('/api/removeNewcomerPoolGame'),
            invalidatesTags: invalidatePool,
        }),
    })
});

export type NewcomerPoolGame = {
    id: string,
    game: Pick<GameObject, 'id' | 'name' | 'imageUrl'>,
    // the authors of the other games stay hidden
    isMine: boolean
}

export type NewcomerPool = {
    games: NewcomerPoolGame[],
    // the event leaves the registration with this many games
    minGames: number,
    gamesPerPlayer: number
}

export type AddNewcomerPoolGameRequest = {
    eventId: string,
    gameId: string
}

export type ReplaceNewcomerPoolGameRequest = {
    eventId: string,
    poolGameId: string,
    gameId: string
}

export type RemoveNewcomerPoolGameRequest = {
    eventId: string,
    poolGameId: string
}

export type ChangeNewcomerPoolResponse = {
    poolGame: NewcomerPoolGame
}

export const {
    useGetNewcomerPoolQuery,
    useAddNewcomerPoolGameMutation,
    useReplaceNewcomerPoolGameMutation,
    useRemoveNewcomerPoolGameMutation,
} = newcomerPoolApi;
