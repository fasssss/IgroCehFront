import { KeyboardEvent, ReactNode, useRef } from "react";
import './styles.scss';

// "ИГРОЦЕХ / Tab" of the design system; arrows move between the tabs, as in the WAI-ARIA tabs pattern
const DsTabs = <TId extends string>({ tabs, value, onChange, label, className }: DsTabsProps<TId>) => {
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const enabledIndexes = tabs.flatMap((tab, index) => tab.disabled ? [] : [index]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if(!keys.includes(e.key) || enabledIndexes.length === 0) return;
        e.preventDefault();

        const current = enabledIndexes.indexOf(tabs.findIndex(tab => tab.id === value));
        const next =
            e.key === 'Home' ? 0 :
            e.key === 'End' ? enabledIndexes.length - 1 :
            (current + (e.key === 'ArrowRight' ? 1 : -1) + enabledIndexes.length) % enabledIndexes.length;
        const index = enabledIndexes[next];
        tabRefs.current[index]?.focus();
        onChange(tabs[index].id);
    }

    return(
        <div role="tablist" aria-label={label} className={`ds-tabs ${className || ''}`} onKeyDown={handleKeyDown}>
            {
                tabs.map((tab, index) => {
                    const isActive = tab.id === value;
                    return(
                        <button key={tab.id}
                            ref={element => { tabRefs.current[index] = element; }}
                            type="button"
                            role="tab"
                            id={tab.tabId}
                            aria-selected={isActive}
                            aria-controls={tab.panelId}
                            tabIndex={isActive ? 0 : -1}
                            disabled={tab.disabled}
                            className={`ds-tabs__tab ${isActive ? 'ds-tabs__tab--active' : ''}`}
                            onClick={() => onChange(tab.id)}
                        >
                            {tab.icon && <span className="ds-tabs__icon" aria-hidden>{tab.icon}</span>}
                            {tab.label}
                            {tab.after}
                        </button>
                    );
                })
            }
        </div>
    );
}

export type DsTab<TId extends string> = {
    id: TId,
    label: ReactNode,
    icon?: ReactNode,
    // shown after the label, e.g. the "soon" mark
    after?: ReactNode,
    disabled?: boolean,
    // ids that link the tab and its panel for screen readers
    tabId?: string,
    panelId?: string
}

type DsTabsProps<TId extends string> = {
    tabs: DsTab<TId>[],
    value: TId,
    onChange: (id: TId) => void,
    label: string,
    className?: string
}

export { DsTabs }
