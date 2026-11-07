// PSN has no sign-in for other sites, so the link happens on a page of the site with a code the player puts in the profile on the console
export const PSN_LINK_PATH = '/psn-link';

export const psnProfileUrl = (onlineId: string) => `https://profile.playstation.com/${encodeURIComponent(onlineId)}`;

export const psnLinkPath = (returnPath: string) => `${PSN_LINK_PATH}?returnPath=${encodeURIComponent(returnPath)}`;

// mirrors PsnLimits.IsOnlineId on backend
export const PSN_ONLINE_ID_MAX_LENGTH = 16;
export const isPsnOnlineId = (onlineId: string) => /^[A-Za-z0-9_-]{3,16}$/.test(onlineId);

// the API gives only the code, so the tab remembers the online id: a player back from the console gets the same code by starting again
const ONLINE_ID_KEY = 'psnLinkOnlineId';

export const rememberPsnOnlineId = (onlineId: string) => {
    try {
        sessionStorage.setItem(ONLINE_ID_KEY, onlineId);
    } catch {
        // without the storage the player types the online id again and gets the same code
    }
};

export const readPsnOnlineId = (): string | null => {
    try {
        const onlineId = sessionStorage.getItem(ONLINE_ID_KEY);
        return onlineId && isPsnOnlineId(onlineId) ? onlineId : null;
    } catch {
        return null;
    }
};

export const forgetPsnOnlineId = () => {
    try {
        sessionStorage.removeItem(ONLINE_ID_KEY);
    } catch {
        // nothing to forget
    }
};
