import { globalEventPath } from "root/features/globalEvents/globalEventPath";
import { playerProfilePath } from "root/features/players/playerProfilePath";

// the menu of the header: a group is expanded while the user is in its section;
// an item without `to` is a part of the site that is not made yet and is shown as "soon"
export type NavItem = {
    labelKey: string,
    to?: string,
    isActive?: boolean
}

export type NavGroup = {
    id: 'events' | 'ladder',
    labelKey: string,
    to: string,
    isActive: boolean,
    items: NavItem[]
}

type NavigationContext = {
    pathname: string,
    tab: string | null,
    userId?: string,
    activeGlobalEventId?: string
}

export const LADDER_TAB = 'ladder';

export const buildNavigation = ({ pathname, tab, userId, activeGlobalEventId }: NavigationContext): NavGroup[] => {
    const isCommunities = pathname === '/' || pathname.startsWith('/guild/');
    const isFest = pathname.startsWith('/global-event/');
    const myLadderPath = userId ? `${playerProfilePath(userId)}?tab=${LADDER_TAB}` : undefined;
    const isMyLadder = !!userId && pathname === playerProfilePath(userId) && tab === LADDER_TAB;
    const festPath = activeGlobalEventId ? globalEventPath(activeGlobalEventId) : undefined;

    return [
        {
            id: 'events',
            labelKey: 'nav.events',
            to: '/',
            isActive: isCommunities,
            items: [
                { labelKey: 'nav.currentSeason' },
                { labelKey: 'nav.communities', to: '/', isActive: isCommunities },
                { labelKey: 'nav.rating' },
            ]
        },
        {
            id: 'ladder',
            labelKey: 'nav.ladder',
            // Igrofest is the part of the ladder that exists, without an active one the own ladder games are shown
            to: festPath ?? myLadderPath ?? '/',
            isActive: isFest || isMyLadder,
            items: [
                { labelKey: 'nav.igrofest', to: festPath, isActive: isFest },
                { labelKey: 'nav.regular' },
                { labelKey: 'nav.myGames', to: myLadderPath, isActive: isMyLadder },
                { labelKey: 'nav.playersRating' },
                { labelKey: 'nav.howItWorks' },
            ]
        }
    ];
}
