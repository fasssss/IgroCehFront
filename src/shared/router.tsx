import { createBrowserRouter, RouteObject } from "react-router-dom";
import {
    LoginPage,
    RedirectLoginPage,
    GuildsBrowsingPage,
    GuildPage,
    EventStageRouter,
    LeaderBoardPage,
    PlayerProfilePage,
    ReviewPage,
    ReviewsPage,
    GlobalEventConstructorPage,
    GlobalEventPage,
    GlobalEventClaimsPage,
    SteamLinkPage,
    XboxLinkPage,
    PsnLinkPage
} from "../features";
import Layout from "./components/Layout";

// the showcase of the design system exists only in the dev build, the production bundle drops it with the import
const devRoutes: RouteObject[] = import.meta.env.DEV ? [{
    path: "ds-preview",
    lazy: async () => ({ Component: (await import("./components/DsPreview")).default })
}] : [];

const router = createBrowserRouter([
    ...devRoutes,
    {
        path: "login",
        element: <LoginPage />
    },
    {
        path: "redirectTo",
        element: <RedirectLoginPage />
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <GuildsBrowsingPage />
            },
            {
                path: "guild/:guildId",
                element: <GuildPage />
            },
            {
                path: "guild/:guildId/leader-board",
                element: <LeaderBoardPage />
            },
            {
                // the hero of the profile starts right under the header
                path: "user/:userId",
                element: <PlayerProfilePage />,
                handle: { flush: true }
            },
            {
                // the reviews to write and to answer and every review the user can read
                path: "reviews",
                element: <ReviewsPage />
            },
            {
                // the paired review of a passed game
                path: "reviews/:eventRecordId",
                element: <ReviewPage />
            },
            {
                // the administrator of the site constructs a global event
                path: "global-event/new",
                element: <GlobalEventConstructorPage />
            },
            {
                // the games of a global event, the banner of the main page leads here
                path: "global-event/:globalEventId",
                element: <GlobalEventPage />
            },
            {
                // the administrators of the site check the claims that the picked games are passed
                path: "global-event/:globalEventId/claims",
                element: <GlobalEventClaimsPage />
            },
            {
                // the same constructor changes an existing global event
                path: "global-event/:globalEventId/edit",
                element: <GlobalEventConstructorPage />
            },
            {
                // Steam sends the user here after the sign-in that links their Steam account
                path: "steam-link",
                element: <SteamLinkPage />
            },
            {
                // OpenXBL sends the user here after the sign-in that links their Xbox account
                path: "xbox-link",
                element: <XboxLinkPage />
            },
            {
                // the player proves their PSN account with a code in its profile, PSN has no sign-in for other sites
                path: "psn-link",
                element: <PsnLinkPage />
            },
            {
                // stage is chosen by event status, "/*" keeps old stage links (ordering-stage etc.) working
                path: "guild/:guildId/event/:eventId/*",
                element: <EventStageRouter />
            }
        ]
    }
]);

export { router };
