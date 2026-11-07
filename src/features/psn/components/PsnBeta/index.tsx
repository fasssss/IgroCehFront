import { useTranslation } from "react-i18next";
import './styles.scss';

// PSN stays in beta until a player with a console has checked it on the real PSN
const PsnBeta = () => {
    const { t } = useTranslation();
    return <span className="psn-beta" title={t("PSN linking is being tested, something may not work yet")}>beta</span>;
};

export { PsnBeta }
