//import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useGetScoresByGuildQuery, useGetGuildByIdQuery } from "../../guildsApi";
import './styles.scss';

const LeaderBoardPage = () => {
    const { guildId } = useParams();
    const leaderBoardData = useGetScoresByGuildQuery({ guildId: guildId || '' });
    const guild = useGetGuildByIdQuery({ guildId: guildId });

    return(
        <div className="leader-board">
            <div className="leader-board__header">
                {
                    guild.data?.guildObject.iconUrl &&
                    <img src={guild.data.guildObject.iconUrl} />
                }
                <h1>{guild.data?.guildObject.name}</h1>
            </div>
            <div className="leader-board__body">
                {leaderBoardData.data?.scores
                .sort((firstScore, secondScore) => firstScore.score - secondScore.score)
                .map((scoreData, index) => {
                    return(
                        <div key={scoreData.userId} className="leader-board__score-item">
                            <div className="leader-board__score-item-position">
                                #{index}.
                            </div>
                            <div className="leader-board__score-item-user">
                                {scoreData.avatarUrl}
                                {scoreData.userName}
                            </div>
                            <div className="leader-board__score-item-score">
                                {scoreData.score}
                            </div>
                            <div className="leader-board__score-item-events-played">
                                {scoreData.eventsPlayed}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export { LeaderBoardPage }