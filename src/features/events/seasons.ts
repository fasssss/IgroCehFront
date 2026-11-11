// the server counts the seasons (getEventSeasons, seasonStartsAt of an event); they start on the 1st at 00:00 UTC,
// so they are shown in UTC to stay the 1st everywhere
const formatSeasonDate = (date: Date | string, language: string) =>
    new Date(date).toLocaleString(language, { day: 'numeric', month: 'long', timeZone: 'UTC' });

export { formatSeasonDate }
