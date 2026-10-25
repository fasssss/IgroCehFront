// a member of the guild who isn't in the active event joins it here and rolls a game of the pool
export const NEWCOMER_JOIN_SUBPATH = 'join';

export const newcomerJoinPath = (guildId: string | undefined, eventId: string) =>
    `/guild/${guildId}/event/${eventId}/${NEWCOMER_JOIN_SUBPATH}`;
