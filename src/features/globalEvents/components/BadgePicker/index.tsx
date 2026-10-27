import { useTranslation } from "react-i18next";
import { useGetGlobalEventBadgeUsesQuery } from "../../globalEventsApi";
import { BADGES } from "../../badges";
import './styles.scss';

// the administrator picks the badge a player gets for passing the event; under every badge the other events that give it already
const BadgePicker = ({ globalEventId, value, isLocked, onChange }: BadgePickerProps) => {
    const { t } = useTranslation();
    const badgeUses = useGetGlobalEventBadgeUsesQuery(undefined, { refetchOnMountOrArgChange: true });
    const usesOf = (badgeId: string) => badgeUses.data?.badgeUses.filter(use => use.badgeId === badgeId && use.globalEventId !== globalEventId) ?? [];

    return(
        <div className="badge-picker" role="radiogroup" aria-label={t("The reward for the passing")}>
            {
                BADGES.map(badge => {
                    const uses = usesOf(badge.id);
                    const isSelected = value === badge.id;
                    return(
                        <button
                        key={badge.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={isLocked && !isSelected}
                        className={`badge-picker__badge ${isSelected ? "badge-picker__badge--selected" : ""}`}
                        onClick={() => onChange(badge.id)}>
                            <img src={badge.url} className="badge-picker__image" alt={badge.id} />
                            <span className={`badge-picker__uses ${uses.length ? "badge-picker__uses--used" : ""}`}>
                                {
                                    uses.length ?
                                    t("Already the reward of: {{events}}", {
                                        events: uses.map(use => t("«{{name}}» (got: {{count}})", { name: use.globalEventName, count: use.passedCount })).join(", ")
                                    })
                                    :
                                    t("Not a reward yet")
                                }
                            </span>
                        </button>
                    );
                })
            }
        </div>
    );
};

type BadgePickerProps = {
    // the event being changed, its own badge isn't counted as used by another event
    globalEventId?: string,
    value: string | null,
    // somebody has got the badge already, it can't change
    isLocked: boolean,
    onChange: (badgeId: string) => void
}

export { BadgePicker }
