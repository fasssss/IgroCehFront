import { useTranslation } from "react-i18next";
import { WarningAmberRounded } from "@mui/icons-material";
import { useGetPsnStatusQuery } from "../../psnApi";
import './styles.scss';

// only for the administrator of the site: the site reads PSN with a service account, which needs a new NPSSO by hand once in a while;
// nothing is shown while it is fine or unknown
const PsnStatusWarning = ({ className }: PsnStatusWarningProps) => {
    const { t, i18n } = useTranslation();
    const { data: status } = useGetPsnStatusQuery(undefined, { refetchOnMountOrArgChange: true });

    if(!status) {
        return null;
    }

    const expiresAt = status.npssoExpiresAt && new Date(status.npssoExpiresAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });
    const warning =
        status.isNpssoRefused ? {
            title: t("PSN refuses the service account"),
            text: t("The NPSSO has probably ended or isn't in the settings. Until it is renewed, linking PSN and checking trophies don't work or will stop soon."),
            needsNewNpsso: true,
        }
        : !status.isSignInWorking ? {
            title: t("Couldn't check the service account of PSN"),
            text: t("PSN doesn't answer or the site ran over its limit of requests. Linking PSN and checking trophies may not work now."),
            needsNewNpsso: false,
        }
        : status.isNpssoEnding ? {
            title: t("The NPSSO of the service account of PSN is ending"),
            text: t("PSN says it works until {{date}}. Renew it before the sign-in stops working.", { date: expiresAt }),
            needsNewNpsso: true,
        }
        : null;

    if(!warning) {
        return null;
    }

    return(
        <div className={`psn-status-warning ${className ?? ""}`}>
            <WarningAmberRounded className="psn-status-warning__icon" />
            <div className="psn-status-warning__text">
                <div className="psn-status-warning__title">{warning.title}</div>
                <div>{warning.text}</div>
                {warning.needsNewNpsso && <div>{t("How to renew the NPSSO is written in the README of the API.")}</div>}
            </div>
        </div>
    );
};

type PsnStatusWarningProps = {
    // places the block on the page
    className?: string
}

export { PsnStatusWarning }
