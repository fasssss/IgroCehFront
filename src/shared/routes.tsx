import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../features";

const ApplicationRoutes = () => {
    return(
        <Routes>
            <Route path="login" element={<LoginPage />} />
        </Routes>
    );
}

export { ApplicationRoutes };