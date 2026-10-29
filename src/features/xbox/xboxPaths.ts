import { toLocalPath } from "root/features/steam/steamPaths";

// OpenXBL sends the user here after the sign-in, the address is set in the dashboard of the OpenXBL app
export const XBOX_LINK_PATH = '/xbox-link';

export const xboxProfileUrl = (gamertag: string) => `https://www.xbox.com/play/user/${encodeURIComponent(gamertag)}`;

// OpenXBL comes back to one fixed address and carries no state of the site, so the tab remembers that its user started
// the sign-in: a link with a code opened without it (e.g. sent by someone else) doesn't link a stranger's account
const PENDING_LINK_KEY = 'xboxLink';
const PENDING_LINK_LIFETIME = 30 * 60 * 1000;

export const rememberXboxLink = (returnPath: string) => {
    try {
        sessionStorage.setItem(PENDING_LINK_KEY, JSON.stringify({ returnPath, startedAt: Date.now() }));
    } catch {
        // without the storage the code isn't taken, the page of the return says so
    }
};

// the page the user started the sign-in from, null when this tab didn't start one lately
export const readXboxLink = (): string | null => {
    try {
        const pending = JSON.parse(sessionStorage.getItem(PENDING_LINK_KEY) ?? 'null');
        return typeof pending?.returnPath === 'string' && Date.now() - pending.startedAt < PENDING_LINK_LIFETIME
            ? toLocalPath(pending.returnPath)
            : null;
    } catch {
        return null;
    }
};

// a sign-in brings one code, the mark is used with it
export const forgetXboxLink = () => {
    try {
        sessionStorage.removeItem(PENDING_LINK_KEY);
    } catch {
        // nothing to forget
    }
};
