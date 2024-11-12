import { createBrowserRouter } from "react-router-dom";
import { 
    LoginPage, 
    RedirectLoginPage, 
    GuildsBrowsingPage,
    GuildPage,
    EventPage
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
            }
        ]
    }
]);

export { router };