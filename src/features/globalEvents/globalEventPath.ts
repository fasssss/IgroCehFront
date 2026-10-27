// the constructor of a new global event, only for the administrator of the site
export const NEW_GLOBAL_EVENT_PATH = '/global-event/new';

// the same constructor for an existing event
export const globalEventEditPath = (globalEventId: string) => `/global-event/${globalEventId}/edit`;
