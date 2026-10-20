// a link from a guild page keeps the guild selected in the profile
export const playerProfilePath = (userId: string, guildId?: string) =>
    guildId ? `/user/${userId}?guild=${guildId}` : `/user/${userId}`;
