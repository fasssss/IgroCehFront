import { createBrowserRouter } from "react-router-dom";
import { LoginPage, RedirectLoginPage, SearchBar } from "../features";
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
                path: "browsing",
                element: <SearchBar />
            }
        ]
    }
]);

export { router };