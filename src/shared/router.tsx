import { createBrowserRouter } from "react-router-dom";
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
    SteamLinkPage
} from "../features";
import Layout from "./components/Layout";

const router = createBrowserRouter([
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
                // ?guild= selects one of the guilds shared with the player
                path: "user/:userId",
                element: <PlayerProfilePage />
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
                // stage is chosen by event status, "/*" keeps old stage links (ordering-stage etc.) working
                path: "guild/:guildId/event/:eventId/*",
                element: <EventStageRouter />
            }
        ]
    }
]);

export { router };
