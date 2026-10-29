import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { isConflictError } from "root/shared/igroCehApi";
import { useLinkXboxMutation } from "../../xboxApi";
import { forgetXboxLink, readXboxLink } from "../../xboxPaths";
import { XboxSignInButton } from "../XboxSignInButton";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// OpenXBL sends the user here after the sign-in with the code of Microsoft (it has ! and * in it); the code is passed to the API
// only when this tab started the sign-in, then the user goes straight back to the page they left
const XboxLinkPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // the code is taken once: OpenXBL exchanges it only once
    const [code] = useState(() => searchParams.get('code'));
    const [returnPath] = useState(readXboxLink);
    const isSent = useRef(false);
    const [linkXbox, linkResult] = useLinkXboxMutation();

    useEffect(() => {
        if(isSent.current || !code || !returnPath) {
            return;
        }

        isSent.current = true;
        forgetXboxLink();
        linkXbox(code).unwrap()
            .then(() => navigate(returnPath, { replace: true }))
            .catch(() => {
                // the refusal is shown below
            });
    }, [code, returnPath, linkXbox, navigate]);

    const backPath = returnPath ?? '/';
    const retryButtons =
        <div className="xbox-link-page__actions">
            <XboxSignInButton returnPath={backPath}>{t("Try again")}</XboxSignInButton>
            <CommonButton onClick={() => navigate(backPath, { replace: true })}>{t("Go back")}</CommonButton>
        </div>;

    if(!code || !returnPath || linkResult.isError) {
        const error = linkResult.error;
        return(
            <div className="xbox-link-page">
                <h2 className="xbox-link-page__title">
                    {
                        !code ? t("The sign-in to Xbox is cancelled")
                        : !returnPath ? t("The sign-in to Xbox wasn't started in this tab")
                        : isConflictError(error) ? t("This Xbox account is linked to another player")
                        : errorStatus(error) === 503 ? t("Xbox doesn't answer, try later")
                        : t("Xbox didn't confirm the sign-in, try again")
                    }
                </h2>
                {code && !returnPath && <div>{t("Press the button of the sign-in on the site once more.")}</div>}
                {retryButtons}
            </div>
        );
    }

    return(
        <div className="xbox-link-page">
            <CircularProgress color="primary" />
            <div>{t("Checking the sign-in to Xbox")}</div>
        </div>
    );
};

export { XboxLinkPage }
