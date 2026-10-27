// the constructor of a new global event, only for the administrator of the site
export const NEW_GLOBAL_EVENT_PATH = '/global-event/new';

// the page of a global event with its games, the banner of the main page leads here
export const globalEventPath = (globalEventId: string) => `/global-event/${globalEventId}`;

// the claims that the games of the event are passed, only for the administrators of the site
export const globalEventClaimsPath = (globalEventId: string) => `/global-event/${globalEventId}/claims`;

// the same constructor for an existing event
export const globalEventEditPath = (globalEventId: string) => `/global-event/${globalEventId}/edit`;
