import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { isConflictError } from "root/shared/igroCehApi";
import { useLinkSteamMutation } from "../../steamApi";
import { toLocalPath } from "../../steamPaths";
import { SteamProfileWarning } from "../SteamProfileWarning";
import { SteamSignInButton } from "../SteamSignInButton";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// Steam sends the user here after the sign-in; with public game details they go straight back to the page they left,
// otherwise they learn what to open in Steam
const SteamLinkPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // the answer of Steam is taken once: Steam may refuse to confirm the same answer twice
    const [parameters] = useState(() => Object.fromEntries(searchParams));
    const isSent = useRef(false);
    const [linkSteam, linkResult] = useLinkSteamMutation();
    const returnPath = toLocalPath(parameters.returnPath);
    const mode = parameters['openid.mode'];

    useEffect(() => {
        if(isSent.current || mode !== 'id_res') {
            return;
        }

        isSent.current = true;
        linkSteam(parameters).unwrap()
            .then(({ isGameDataPublic }) => {
                if(isGameDataPublic) {
                    navigate(returnPath, { replace: true });
                }
            })
            .catch(() => {
                // the refusal is shown below
            });
    }, [mode, parameters, returnPath, linkSteam, navigate]);

    const goBack = () => navigate(returnPath, { replace: true });
    const retryButtons =
        <div className="steam-link-page__actions">
            <SteamSignInButton returnPath={returnPath}>{t("Try again")}</SteamSignInButton>
            <CommonButton onClick={goBack}>{t("Go back")}</CommonButton>
        </div>;

    if(mode !== 'id_res' || linkResult.isError) {
        const error = linkResult.error;
        return(
            <div className="steam-link-page">
                <h2 className="steam-link-page__title">
                    {
                        mode === 'cancel' ? t("The sign-in to Steam is cancelled")
                        : isConflictError(error) ? t("This Steam account is linked to another player")
                        : errorStatus(error) === 503 ? t("Steam doesn't answer, try later")
                        : t("Steam didn't confirm the sign-in, try again")
                    }
                </h2>
                {retryButtons}
            </div>
        );
    }

    // public game details lead straight back
    if(!linkResult.isSuccess || linkResult.data.isGameDataPublic) {
        return(
            <div className="steam-link-page">
                <CircularProgress color="primary" />
                <div>{t("Checking the sign-in to Steam")}</div>
            </div>
        );
    }

    return(
        <div className="steam-link-page">
            <h2 className="steam-link-page__title">{t("Steam is linked")}</h2>
            {
                linkResult.data.isGameDataPublic === null ?
                <div>{t("Couldn't check whether the game details are open: Steam doesn't answer")}</div>
                :
                <SteamProfileWarning className="steam-link-page__warning" />
            }
            <div className="steam-link-page__actions">
                <CommonButton color="success" onClick={goBack}>{t("Continue")}</CommonButton>
            </div>
        </div>
    );
};

export { SteamLinkPage }
