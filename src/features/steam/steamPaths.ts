// Steam sends the user here after the sign-in, the answer is passed to the API
export const STEAM_LINK_PATH = '/steam-link';

export const steamProfileUrl = (steamId: string) => `https://steamcommunity.com/profiles/${steamId}`;

// the game details have to be public for Steam to give the achievements of a player
export const STEAM_PRIVACY_SETTINGS_URL = 'https://steamcommunity.com/my/edit/settings';

// the return path comes back in the address, only a path of the site is followed
export const toLocalPath = (path: string | undefined) =>
    path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : '/';
