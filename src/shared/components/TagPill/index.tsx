import { PropsWithChildren } from "react";
import './styles.scss';

// a capsule of the profile layouts (platforms, aspects, genres): solid with dark text or a 10% tint with colored text;
// `color` replaces the solid fill, e.g. the color of a platform family
const TagPill = ({ tone = 'neutral', variant = 'solid', color, title, className, children }: PropsWithChildren<TagPillProps>) => {
    return(
        <span className={`tag-pill tag-pill--${variant} tag-pill--${tone} ${className || ''}`}
            style={color && variant === 'solid' ? { backgroundColor: color } : undefined}
            title={title}
        >
            {children}
        </span>
    );
}

type TagPillProps = {
    tone?: 'neutral' | 'success' | 'error' | 'info' | 'warning',
    variant?: 'solid' | 'tint',
    color?: string,
    title?: string,
    className?: string
}

export { TagPill }
