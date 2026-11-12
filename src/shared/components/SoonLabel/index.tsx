import { useTranslation } from "react-i18next";
import './styles.scss';

// the mark of a part of the site that is not made yet (the Regular roster, the ladder rating, …)
const SoonLabel = ({ className }: { className?: string }) => {
    const { t } = useTranslation();
    return <span className={`soon-label ${className || ''}`}>{t('soon')}</span>;
}

export { SoonLabel }
