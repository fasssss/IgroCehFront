import { MouseEventHandler, PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";
import './styles.scss';

// "ИГРОЦЕХ / Button" of the design system: outline for ordinary actions, primary (brand fill) for the main one,
// filled for a state that is already set (e.g. a linked account); with `to` it is a link that looks like a button
const DsButton = ({
    variant = 'outline',
    size = 'medium',
    icon,
    uppercase,
    fullWidth,
    disabled,
    to,
    type = 'button',
    onClick,
    title,
    className,
    children
}: PropsWithChildren<DsButtonProps>) => {
    const classes = [
        'ds-button',
        `ds-button--${variant}`,
        `ds-button--${size}`,
        uppercase && 'ds-button--uppercase',
        fullWidth && 'ds-button--full-width',
        className
    ].filter(Boolean).join(' ');

    const content =
        <>
            {icon && <span className="ds-button__icon" aria-hidden>{icon}</span>}
            {children}
        </>;

    if(to && !disabled) {
        return <Link to={to} className={classes} title={title}>{content}</Link>;
    }

    return(
        <button type={type} className={classes} disabled={disabled} onClick={onClick} title={title}>
            {content}
        </button>
    );
}

type DsButtonProps = {
    variant?: 'outline' | 'primary' | 'filled',
    // 48px in the design system, 60px for the account buttons of the profile
    size?: 'medium' | 'large',
    icon?: ReactNode,
    uppercase?: boolean,
    fullWidth?: boolean,
    disabled?: boolean,
    to?: string,
    type?: 'button' | 'submit',
    onClick?: MouseEventHandler<HTMLButtonElement>,
    title?: string,
    className?: string
}

export { DsButton }
