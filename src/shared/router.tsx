import { createBrowserRouter } from "react-router-dom";
import { 
    LoginPage, 
    RedirectLoginPage, 
    GuildsBrowsingPage,
    GuildPage,
    EventPage,
    AuctionShufflingStagePage,
    GameGuessPage
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
                path: "guild/:guildId/event/:eventId",
                element: <EventPage />
            },
            {
                path: "guild/:guildId/event/:eventId/ordering-stage",
                element: <AuctionShufflingStagePage />
            },
            {
                path: "guild/:guildId/event/:eventId/guessing-stage",
                element: <GameGuessPage />
            }
        ]
    }
]);

export { router };