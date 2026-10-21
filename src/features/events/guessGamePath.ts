// the participant changes the guessed game here until the creator activates the event
export const GUESS_GAME_SUBPATH = 'guess';

export const guessGamePath = (guildId: string | undefined, eventId: string) =>
    `/guild/${guildId}/event/${eventId}/${GUESS_GAME_SUBPATH}`;
