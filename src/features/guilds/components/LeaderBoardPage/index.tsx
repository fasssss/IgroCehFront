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
                {leaderBoardData.data?.scores &&
                [...leaderBoardData.data?.scores]
                .sort((firstScore, secondScore) => secondScore.score - firstScore.score)
                .map((scoreData, index) => {
                    return(
                        <div key={scoreData.userId} className="leader-board__score-item">
                            <div className="leader-board__score-item-left">
                                <div className="leader-board__score-item-position">
                                    <h2>#{index + 1}.</h2>
                                </div>
                                <div className="leader-board__score-item-user">
                                    <img src={scoreData.avatarUrl} />
                                    <h3>{scoreData.userName}</h3>
                                </div>
                            </div>
                            <div className="leader-board__score-item-right">
                                <div className="leader-board__score-item-score">
                                    <h3>Total score: {scoreData.score}</h3>
                                </div>
                                <div className="leader-board__score-item-events-played">
                                    <h3>Total games played: {scoreData.eventsPlayed}</h3>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export { LeaderBoardPage }