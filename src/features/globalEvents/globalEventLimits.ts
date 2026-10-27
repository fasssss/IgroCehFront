// the same limits are checked by the API (Application.Consts.GlobalEventLimits)
export const GLOBAL_EVENT_NAME_MAX_LENGTH = 100;
export const GLOBAL_EVENT_DESCRIPTION_MAX_LENGTH = 2000;
// a player rolls three games at once
export const GLOBAL_EVENT_MIN_GAMES = 3;
export const GLOBAL_EVENT_MAX_GAMES = 50;
export const GLOBAL_EVENT_MAX_ACHIEVEMENTS_PER_GAME = 10;
// the picked game can be refused for a new roll when this many days have passed since the pick
export const GLOBAL_EVENT_REFUSAL_DELAY_DAYS = 7;

// the API takes these images (API.Helpers.UploadedImages)
export const GLOBAL_EVENT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const GLOBAL_EVENT_IMAGE_MAX_SIZE = 10 * 1024 * 1024;
