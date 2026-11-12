// the server counts the seasons (getEventSeasons, seasonStartsAt of an event); they start on the 1st at 00:00 UTC,
// so they are shown in UTC to stay the 1st everywhere
const formatSeasonDate = (date: Date | string, language: string) =>
    new Date(date).toLocaleString(language, { day: 'numeric', month: 'long', timeZone: 'UTC' });

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

// a date of the server comes without a zone and is UTC, while the browser would read it as local time
const parseServerDate = (date: Date | string) =>
    typeof date === 'string' && !/(z|[+-]\d\d:?\d\d)$/i.test(date) ? new Date(`${date}Z`) : new Date(date);

// seasons of three months like the server counts them: winter from December, spring from March, summer from June
const seasonOf = (date: Date | string): Season => {
    const month = parseServerDate(date).getUTCMonth();
    if(month === 11 || month < 2) return 'winter';
    if(month < 5) return 'spring';
    if(month < 8) return 'summer';
    return 'autumn';
};

export { formatSeasonDate, seasonOf }
