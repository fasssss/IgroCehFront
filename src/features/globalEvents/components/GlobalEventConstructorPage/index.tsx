import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircularProgress } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useGetGlobalEventQuery } from "../../globalEventsApi";
import { GlobalEventConstructor } from "../GlobalEventConstructor";
import './styles.scss';

// the constructor of a new global event or of the one in the path, only for the administrator of the site
const GlobalEventConstructorPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { globalEventId } = useParams();
    const user = useCurrentUser();
    const isImageFailed = !!(useLocation().state as GlobalEventConstructorPageState | null)?.isImageFailed;
    const globalEvent = useGetGlobalEventQuery(user?.isAppAdmin && globalEventId ? globalEventId : skipToken, { refetchOnMountOrArgChange: true });

    if(user && !user.isAppAdmin) {
        return <Navigate to="/" replace />;
    }

    if(!user || globalEvent.isLoading) {
        return(
            <div className="global-event-constructor-page__message">
                <CircularProgress color="primary" />
            </div>
        );
    }

    if(globalEventId && !globalEvent.data?.globalEvent) {
        return(
            <div className="global-event-constructor-page__message">
                {globalEvent.isError ? t("The event isn't found") : null}
                <CommonButton onClick={() => navigate('/')}>{t("To the main page")}</CommonButton>
            </div>
        );
    }

    // a saved event starts its form over
    return(
        <GlobalEventConstructor
        key={globalEventId ?? "new"}
        globalEvent={globalEvent.data?.globalEvent ?? undefined}
        isImageFailed={isImageFailed} />
    );
};

export type GlobalEventConstructorPageState = {
    // the event was saved, but its image wasn't
    isImageFailed: boolean
}

export { GlobalEventConstructorPage }
