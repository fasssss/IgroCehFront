import { globalEventPath } from "root/features/globalEvents/globalEventPath";
import { playerProfilePath } from "root/features/players/playerProfilePath";
import { profileTabPath } from "root/features/players/profileTabs";

// the menu of the header: the title of a group opens its items, a page opens the group of its section (isActive);
// an item without `to` is a part of the site that is not made yet and is shown as "soon"
export type NavItem = {
    labelKey: string,
    to?: string,
    isActive?: boolean
}

export type NavGroup = {
    id: 'events' | 'ladder',
    labelKey: string,
    isActive: boolean,
    items: NavItem[]
}

type NavigationContext = {
    pathname: string,
    tab: string | null,
    userId?: string,
    activeGlobalEventId?: string
}

export const buildNavigation = ({ pathname, tab, userId, activeGlobalEventId }: NavigationContext): NavGroup[] => {
    const isCommunities = pathname === '/' || pathname.startsWith('/guild/');
    const isFest = pathname.startsWith('/global-event/');
    // "Мои игры" of the ladder is the tab "Мои игры" of the own profile
    const myGamesPath = userId ? profileTabPath(userId, 'games') : undefined;
    const isMyGames = !!userId && pathname === playerProfilePath(userId) && tab === 'games';
    const festPath = activeGlobalEventId ? globalEventPath(activeGlobalEventId) : undefined;

    return [
        {
            id: 'events',
            labelKey: 'nav.events',
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
            isActive: isFest || isMyGames,
            items: [
                { labelKey: 'nav.igrofest', to: festPath, isActive: isFest },
                { labelKey: 'nav.regular' },
                { labelKey: 'nav.myGames', to: myGamesPath, isActive: isMyGames },
                { labelKey: 'nav.playersRating' },
                { labelKey: 'nav.howItWorks' },
            ]
        }
    ];
}
