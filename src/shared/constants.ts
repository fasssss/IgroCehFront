export const igroCehApiBaseUrl: string = import.meta.env.VITE_IGRO_CEH_API;
export const igroCehWebSocketBaseUrl: string = import.meta.env.VITE_IGRO_CEH_WEB_SOCKET;

// mirrors Domain.Enums.EventStatusId on backend
export const EventStatus = {
    PlayersRegistration: 0,
    PlayersShuffle: 1,
    GuessingGames: 2,
    RevealingGames: 3,
    Active: 4,
    Finished: 5,
} as const;

export type EventStatus = typeof EventStatus[keyof typeof EventStatus];

// names are also used as translation keys
export const EVENT_STATUS_NAME: Record<EventStatus, string> = {
    [EventStatus.PlayersRegistration]: 'Players registration',
    [EventStatus.PlayersShuffle]: 'Players shuffle',
    [EventStatus.GuessingGames]: 'Guessing games',
    [EventStatus.RevealingGames]: 'Revealing games',
    [EventStatus.Active]: 'Active',
    [EventStatus.Finished]: 'Finished',
};

export const EVENT_STATUS_COLOR: Record<EventStatus, 'error' | 'success' | 'warning'> = {
    [EventStatus.PlayersRegistration]: 'warning',
    [EventStatus.PlayersShuffle]: 'warning',
    [EventStatus.GuessingGames]: 'warning',
    [EventStatus.RevealingGames]: 'warning',
    [EventStatus.Active]: 'success',
    [EventStatus.Finished]: 'error',
};
