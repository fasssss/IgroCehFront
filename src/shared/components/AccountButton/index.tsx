import iconClose from "root/assets/design/icon-close.svg";
import './styles.scss';

// an account of a game platform in the profile (layout 20648:706): a linked one is filled and leads to the profile
// on the platform, the owner unlinks it with the cross; a button without `href` links the account
const AccountButton = ({ icon, label, title, href, onUnlink, unlinkLabel, onLink, disabled, error }: AccountButtonProps) => {
    return(
        <span className="account-button">
            {
                href ?
                <span className="account-button__linked">
                    <a href={href} target="_blank" rel="noreferrer" className="account-button__profile" title={title}>
                        <img src={icon} alt="" width={24} height={24} className="account-button__icon" />
                        {label}
                    </a>
                    {
                        onUnlink &&
                        <button type="button" className="account-button__unlink"
                            title={unlinkLabel} aria-label={unlinkLabel}
                            disabled={disabled}
                            onClick={onUnlink}
                        >
                            <img src={iconClose} alt="" width={16} height={16} />
                        </button>
                    }
                </span>
                :
                <button type="button" className="account-button__link" title={title} disabled={disabled} onClick={onLink}>
                    <img src={icon} alt="" width={24} height={24} className="account-button__icon" />
                    {label}
                </button>
            }
            {error && <span className="account-button__error" role="alert">{error}</span>}
        </span>
    );
};

type AccountButtonProps = {
    // the logo of the platform
    icon: string,
    label: string,
    title?: string,
    // the profile on the platform, the account is linked when it is set
    href?: string,
    onUnlink?: () => void,
    unlinkLabel?: string,
    onLink?: () => void,
    disabled?: boolean,
    error?: string
}

export { AccountButton }
