// participants put games for newcomers here while the event gathers players
export const NEWCOMER_POOL_SUBPATH = 'pool';

export const newcomerPoolPath = (guildId: string | undefined, eventId: string) =>
    `/guild/${guildId}/event/${eventId}/${NEWCOMER_POOL_SUBPATH}`;
