import { PropsWithChildren } from "react";
import './styles.scss';

// "ИГРОЦЕХ / Badge" of the design system; the status is always written in the text too, not only in the color
const StatusPill = ({ status, className, children }: PropsWithChildren<StatusPillProps>) => {
    return <span className={`status-pill status-pill--${status} ${className || ''}`}>{children}</span>;
}

export type Status = 'success' | 'info' | 'error' | 'warning';

type StatusPillProps = {
    status: Status,
    className?: string
}

export { StatusPill }
