import { Link } from "react-router-dom";
import { playerProfilePath } from "root/features/players/playerProfilePath";
import { ReviewPlayer } from "../../reviewsApi";
import './styles.scss';

// the avatar and the name of a player, leading to the profile
const ReviewPerson = ({ player, guildId }: ReviewPersonProps) => (
    <Link to={playerProfilePath(player.id, guildId)} className="review-person">
        {
            player.avatarUrl ?
            <img src={player.avatarUrl} className="review-person__avatar" alt="" />
            :
            <span className="review-person__avatar review-person__avatar--empty">{player.userName.charAt(0)}</span>
        }
        {player.userName}
    </Link>
);

type ReviewPersonProps = {
    player: ReviewPlayer,
    // the profile opens with the guild of the reviewed event selected
    guildId: string
}

export { ReviewPerson }
