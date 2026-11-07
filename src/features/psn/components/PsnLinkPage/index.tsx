import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { toLocalPath } from "root/features/steam/steamPaths";
import { useConfirmPsnLinkMutation, useStartPsnLinkMutation } from "../../psnApi";
import { PSN_ONLINE_ID_MAX_LENGTH, forgetPsnOnlineId, isPsnOnlineId, readPsnOnlineId, rememberPsnOnlineId } from "../../psnPaths";
import { PsnBeta } from "../PsnBeta";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// PSN has no sign-in for other sites: the player names the online id, puts the code in the profile on the console and asks to check it.
// A check is the only request to PSN and there is one in 15 minutes, so a mistyped online id or an early check costs that much and the page says so.
// Starting asks nothing of PSN, so a player back from the console gets the same code again
const PsnLinkPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [returnPath] = useState(() => toLocalPath(searchParams.get('returnPath') ?? undefined));
    const [rememberedOnlineId] = useState(readPsnOnlineId);
    const [onlineId, setOnlineId] = useState(rememberedOnlineId ?? "");
    const [isEditing, setIsEditing] = useState(!rememberedOnlineId);
    const [code, setCode] = useState<string | null>(null);
    const isResumed = useRef(false);
    const [startPsnLink, startResult] = useStartPsnLinkMutation();
    const [confirmPsnLink, confirmResult] = useConfirmPsnLinkMutation();
    const resetConfirm = confirmResult.reset;

    const getCode = useCallback(async (id: string) => {
        try {
            const started = await startPsnLink(id).unwrap();
            rememberPsnOnlineId(id);
            setOnlineId(id);
            setCode(started.code);
            setIsEditing(false);
            resetConfirm();
        } catch {
            // the refusal is shown below
        }
    }, [startPsnLink, resetConfirm]);

    useEffect(() => {
        if(rememberedOnlineId && !isResumed.current) {
            isResumed.current = true;
            getCode(rememberedOnlineId);
        }
    }, [rememberedOnlineId, getCode]);

    const check = () => {
        confirmPsnLink().unwrap()
            .then(() => forgetPsnOnlineId())
            .catch(() => {
                // the refusal is shown below
            });
    };

    const goBack = () => navigate(returnPath, { replace: true });
    const trimmedOnlineId = onlineId.trim();
    const title =
        <h2 className="psn-link-page__title">
            {t("Linking PSN")}
            <PsnBeta />
        </h2>;
    const startError = startResult.isError && <div className="psn-link-page__error">{t("Couldn't get the code, try again")}</div>;

    if(confirmResult.isSuccess) {
        return(
            <div className="psn-link-page">
                <h2 className="psn-link-page__title">{t("PSN is linked")}</h2>
                <div className="psn-link-page__account">{confirmResult.data.psnOnlineId}</div>
                <div>{t("The code isn't needed anymore, you can remove it from \"About Me\".")}</div>
                <div className="psn-link-page__actions">
                    <CommonButton color="success" onClick={goBack}>{t("Continue")}</CommonButton>
                </div>
            </div>
        );
    }

    if(isEditing || (!code && startResult.isError)) {
        return(
            <div className="psn-link-page">
                {title}
                <div>{t("PSN has no sign-in for other sites, so the account is proved by a code in the \"About Me\" field of your profile. The field can be changed only on PS4 or PS5.")}</div>
                <div className="psn-link-page__muted">{t("This is a beta: if something goes wrong, write to the administrator.")}</div>
                <CommonField
                className="psn-link-page__field"
                placeholder={t("Your online ID")}
                value={onlineId}
                maxLength={PSN_ONLINE_ID_MAX_LENGTH}
                onChange={e => setOnlineId(e.target.value)} />
                <div className="psn-link-page__muted">{t("An online ID is 3 to 16 letters, digits, hyphens and underscores")}</div>
                {startError}
                <div className="psn-link-page__actions">
                    <CommonButton
                    color="success"
                    disabled={!isPsnOnlineId(trimmedOnlineId) || startResult.isLoading}
                    onClick={() => getCode(trimmedOnlineId)}>
                        {t("Get the code")}
                    </CommonButton>
                    <CommonButton onClick={goBack}>{t("Go back")}</CommonButton>
                </div>
            </div>
        );
    }

    if(!code) {
        return(
            <div className="psn-link-page">
                <CircularProgress color="primary" />
            </div>
        );
    }

    const status = confirmResult.isError ? errorStatus(confirmResult.error) : undefined;
    const isCodeGone = status === 410;
    const refusal =
        status === 400 ? t("The \"About Me\" of {{onlineId}} doesn't show the code yet. Make sure it is saved on the console, a change may not show at once. The next check is in 15 minutes.", { onlineId })
        : status === 404 ? t("PSN has no account {{onlineId}}. Correct the online ID, the code stays the same. The next check is in 15 minutes.", { onlineId })
        : isCodeGone ? t("The code doesn't work anymore. Get a new one and put it in \"About Me\" instead.")
        : status === 429 ? t("The check was made already, there is one in 15 minutes. Try later.")
        : status === 503 ? t("PSN doesn't answer. The next check is in 15 minutes.")
        : confirmResult.isError ? t("Couldn't check the code, try later")
        : null;

    return(
        <div className="psn-link-page">
            {title}
            <div className="psn-link-page__account-row">
                {t("Account")}
                <span className="psn-link-page__account">{onlineId}</span>
            </div>
            <ol className="psn-link-page__steps">
                <li>{t("On PS4 or PS5 open your profile and change the \"About Me\" field.")}</li>
                <li>
                    {t("Add this code to it and save:")}
                    <div className="psn-link-page__code">{code}</div>
                </li>
                <li>{t("Come back here and press \"Check\".")}</li>
            </ol>
            <div className="psn-link-page__warning">
                <WarningAmberRounded className="psn-link-page__warning-icon" />
                {t("There is one check in 15 minutes, so save the code on the console first. The code works for 30 minutes.")}
            </div>
            {refusal && <div className="psn-link-page__error">{refusal}</div>}
            {startError}
            <div className="psn-link-page__actions">
                {
                    isCodeGone ?
                    <CommonButton color="success" disabled={startResult.isLoading} onClick={() => getCode(onlineId)}>{t("Get a new code")}</CommonButton>
                    :
                    <CommonButton color="success" disabled={confirmResult.isLoading} onClick={check}>{t("Check")}</CommonButton>
                }
                <CommonButton onClick={() => setIsEditing(true)}>{t("Change the online ID")}</CommonButton>
                <CommonButton onClick={goBack}>{t("Go back")}</CommonButton>
            </div>
        </div>
    );
};

export { PsnLinkPage }
