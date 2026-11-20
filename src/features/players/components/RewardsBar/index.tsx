import { useTranslation } from "react-i18next";
import iconRewardFailed from "root/assets/design/icon-reward-failed.svg";
import './styles.scss';

// mirrors CalculatePassingReward on backend: a game passed in the first month of the event gives 3 points
const MAX_REWARD = 3;
const COUNTED_REWARDS = [3, 2, 1];

// the share of the points the player could get for the finished games (layout 20648:731):
// a passed game could give MAX_REWARD, a game not passed in time gives nothing; under it the games of every reward
const RewardsBar = ({ rewards, failedCount }: RewardsBarProps) => {
    const { t } = useTranslation();
    const countOf = (reward: number) => rewards.find(item => item.reward === reward)?.count ?? 0;
    const earned = rewards.reduce((sum, { reward, count }) => sum + reward * count, 0);
    const finishedGames = rewards.reduce((sum, { count }) => sum + count, 0) + failedCount;
    const percent = finishedGames ? Math.round(earned / (finishedGames * MAX_REWARD) * 100) : 0;
    // a game passed too late gives 0 points, it is shown only when there is one
    const shownRewards = countOf(0) ? [...COUNTED_REWARDS, 0] : COUNTED_REWARDS;

    const gamesTitle = (label: string, count: number) => t('{{label}}: {{count}} games', { label, count });

    return(
        <div className="rewards-bar">
            <div className="rewards-bar__track" role="progressbar"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
                aria-label={t('profile.pointsEarned')}
            >
                <div className="rewards-bar__fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="rewards-bar__details">
                <div className="rewards-bar__percent">
                    <span className="rewards-bar__percent-value">{percent}%</span>
                    {t('profile.pointsEarned')}
                </div>
                <ul className="rewards-bar__counters">
                    {
                        shownRewards.map(reward => {
                            const count = countOf(reward);
                            return(
                                <li key={reward} className="rewards-bar__counter" title={gamesTitle(t('{{count}} points', { count: reward }), count)}>
                                    <span className={`rewards-bar__reward rewards-bar__reward--${reward}`} aria-hidden>{reward}</span>
                                    <span className="visually-hidden">{t('{{count}} points', { count: reward })}:</span>
                                    {count}
                                </li>
                            );
                        })
                    }
                    <li className="rewards-bar__counter" title={gamesTitle(t('Not completed'), failedCount)}>
                        <img src={iconRewardFailed} alt="" width={24} height={24} className="rewards-bar__failed" />
                        <span className="visually-hidden">{t('Not completed')}:</span>
                        {failedCount}
                    </li>
                </ul>
            </div>
        </div>
    );
}

type RewardsBarProps = {
    rewards: Array<{ reward: number, count: number }>,
    failedCount: number
}

export { RewardsBar }
