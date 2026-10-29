// the same limits are checked by the API (Application.Consts.GlobalEventLimits)
export const GLOBAL_EVENT_NAME_MAX_LENGTH = 100;
export const GLOBAL_EVENT_DESCRIPTION_MAX_LENGTH = 2000;
// a player rolls three games at once
export const GLOBAL_EVENT_MIN_GAMES = 3;
export const GLOBAL_EVENT_MAX_GAMES = 50;
export const GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME = 10;
// the picked game can be refused for a new roll when this many days have passed since the pick
export const GLOBAL_EVENT_REFUSAL_DELAY_DAYS = 7;
// the passing is checked through Steam once in this many minutes
export const GLOBAL_EVENT_PASSING_CHECK_DELAY_MINUTES = 10;
// a claim: the profile the player types, the reason of a rejection the administrator writes
export const GLOBAL_EVENT_CLAIM_PROFILE_MAX_LENGTH = 200;
export const GLOBAL_EVENT_CLAIM_COMMENT_MAX_LENGTH = 500;

// the API takes these images (API.Helpers.UploadedImages)
export const GLOBAL_EVENT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const GLOBAL_EVENT_IMAGE_MAX_SIZE = 10 * 1024 * 1024;

// a badge (Application.Consts.BadgeLimits): a small picture, it goes with every profile that shows it
export const BADGE_NAME_MAX_LENGTH = 50;
export const BADGE_IMAGE_TYPES = ['image/svg+xml', 'image/png', 'image/webp'];
export const BADGE_IMAGE_MAX_SIZE = 256 * 1024;
