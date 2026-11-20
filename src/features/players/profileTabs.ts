import { playerProfilePath } from "./playerProfilePath";

// the tabs of the profile are kept in ?tab=, so a tab can be linked, e.g. the own ladder from the header
export const PROFILE_TABS = ['history', 'ladder', 'guilds', 'games'] as const;

export type ProfileTab = typeof PROFILE_TABS[number];

export const DEFAULT_PROFILE_TAB: ProfileTab = 'history';

export const toProfileTab = (value: string | null): ProfileTab =>
    PROFILE_TABS.find(tab => tab === value) ?? DEFAULT_PROFILE_TAB;

export const profileTabPath = (userId: string, tab: ProfileTab) => `${playerProfilePath(userId)}?tab=${tab}`;
