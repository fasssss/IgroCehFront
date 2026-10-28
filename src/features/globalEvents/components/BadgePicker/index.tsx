import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { useGetBadgesQuery } from "../../globalEventsApi";
import { badgeImageUrl } from "../../badges";
import { BadgeUpload } from "../BadgeUpload";
import './styles.scss';

// the administrator picks the badge a player gets for passing the event or uploads a new one;
// under every badge the other events that give it already
const BadgePicker = ({ globalEventId, value, isLocked, onChange }: BadgePickerProps) => {
    const { t } = useTranslation();
    const badgesQuery = useGetBadgesQuery(undefined, { refetchOnMountOrArgChange: true });

    if(badgesQuery.isError) {
        return <div className="badge-picker__message">{t("Couldn't load the badges, try later")}</div>;
    }

    if(!badgesQuery.data) {
        return <CircularProgress color="primary" />;
    }

    return(
        <div className="badge-picker" role="radiogroup" aria-label={t("The reward for the passing")}>
            {
                badgesQuery.data.badges.map(badge => {
                    const uses = badge.uses.filter(use => use.globalEventId !== globalEventId);
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
                            <img src={badgeImageUrl(badge.id)} className="badge-picker__image" alt="" />
                            <span className="badge-picker__name">{badge.name}</span>
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
            {/* an uploaded badge becomes the reward at once */}
            {!isLocked && <BadgeUpload onUploaded={badge => onChange(badge.id)} />}
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
