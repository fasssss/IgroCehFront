import { Routes, Route } from "react-router-dom";
import { LoginPage, RedirectLoginPage } from "../features";

const ApplicationRoutes = () => {
    return(
        <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="redirectTo" element={<RedirectLoginPage />} />
        </Routes>
    );
}

export { ApplicationRoutes };