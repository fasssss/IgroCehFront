// the constructor of a new global event, only for the administrator of the site
export const NEW_GLOBAL_EVENT_PATH = '/global-event/new';

// the page of a global event with its games, the banner of the main page leads here
export const globalEventPath = (globalEventId: string) => `/global-event/${globalEventId}`;

// the same constructor for an existing event
export const globalEventEditPath = (globalEventId: string) => `/global-event/${globalEventId}/edit`;
