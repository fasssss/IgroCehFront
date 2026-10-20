import { createBrowserRouter } from "react-router-dom";
import {
    LoginPage,
    RedirectLoginPage,
    GuildsBrowsingPage,
    GuildPage,
    EventStageRouter,
    LeaderBoardPage,
    PlayerProfilePage
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
                // stage is chosen by event status, "/*" keeps old stage links (ordering-stage etc.) working
                path: "guild/:guildId/event/:eventId/*",
                element: <EventStageRouter />
            }
        ]
    }
]);

export { router };
