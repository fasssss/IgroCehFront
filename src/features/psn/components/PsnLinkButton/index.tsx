import { PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@mui/material";
import { SvgSelector } from "root/shared/components/SvgSelector";
import { psnLinkPath } from "../../psnPaths";
import { PsnBeta } from "../PsnBeta";
import './styles.scss';

// the button of linking PSN in the blue of PlayStation: it opens the page of the link on the site,
// the page comes back to returnPath (the current page by default)
const PsnLinkButton = ({ returnPath, children }: PropsWithChildren<PsnLinkButtonProps>) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    return(
        <button className="psn-link-button" onClick={() => navigate(psnLinkPath(returnPath ?? location.pathname + location.search))}>
            <SvgIcon className="psn-link-button__logo"><SvgSelector iconName="psn-icon" /></SvgIcon>
            {children ?? t("Link PSN")}
            <PsnBeta />
        </button>
    );
};

type PsnLinkButtonProps = {
    returnPath?: string
}

export { PsnLinkButton }
