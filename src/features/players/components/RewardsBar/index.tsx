import { useState } from "react";
import { useTranslation } from "react-i18next";
import './styles.scss';

// one green from light to dark: more points read brighter on the dark surface,
// the red of not completed games stays distinguishable from the darkest green for colorblind players
const REWARD_COLORS: Record<number, string> = {
    3: '#c6ef7f',
    2: '#8cc907',
    1: '#638f12',
    0: '#476a10',
};
const FAILED_COLOR = '#ef6a5a';

// share of games completed for each reward and of games not completed in time
const RewardsBar = ({ rewards, failedCount }: RewardsBarProps) => {
    const { t } = useTranslation();
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
    const segments = [
        ...rewards.map(({ reward, count }) => ({
            key: `reward-${reward}`,
            label: t('{{count}} points', { count: reward }),
            count,
            color: REWARD_COLORS[reward],
        })),
        { key: 'failed', label: t('Not completed'), count: failedCount, color: FAILED_COLOR },
    ];
    const total = segments.reduce((sum, segment) => sum + segment.count, 0);

    if(total === 0) {
        return <div className="rewards-bar__empty">{t('No completed games yet')}</div>;
    }

    return(
        <div className="rewards-bar">
            <div className="rewards-bar__track">
                {
                    segments.filter(segment => segment.count > 0).map(segment => {
                        const description = t('{{label}}: {{count}} games', { label: segment.label, count: segment.count });
                        return(
                            <div key={segment.key}
                                className="rewards-bar__segment"
                                style={{ flexGrow: segment.count, backgroundColor: segment.color }}
                                tabIndex={0}
                                aria-label={description}
                                onMouseEnter={() => setHoveredSegment(segment.key)}
                                onMouseLeave={() => setHoveredSegment(null)}
                                onFocus={() => setHoveredSegment(segment.key)}
                                onBlur={() => setHoveredSegment(null)}
                            >
                                {
                                    hoveredSegment === segment.key &&
                                    <div className="rewards-bar__tooltip">{description}</div>
                                }
                            </div>
                        );
                    })
                }
            </div>
            <div className="rewards-bar__legend">
                {
                    segments.map(segment =>
                        <div key={segment.key} className="rewards-bar__legend-item">
                            <span className="rewards-bar__swatch" style={{ backgroundColor: segment.color }} />
                            <span className="rewards-bar__legend-label">{segment.label}</span>
                            <span className="rewards-bar__legend-count">{segment.count}</span>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

type RewardsBarProps = {
    rewards: Array<{ reward: number, count: number }>,
    failedCount: number
}

export { RewardsBar }
