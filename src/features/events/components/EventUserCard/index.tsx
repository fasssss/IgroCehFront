import Tilt from 'react-parallax-tilt';
import './styles.scss';

const EventUserCard = ({ avatarUrl, userName }: EventUserCardPropType) => {
    return(
        <Tilt 
        scale={ 1.05 } 
        tiltMaxAngleX={ 10 } 
        tiltMaxAngleY={ 10 } 
        perspective={ 990 } 
        className="user-card"
        >
            <img className="user-card__avatar" src={ avatarUrl } />
            <div className="user-card__user-name">
                { userName }
            </div>
        </Tilt>
    );
}

type EventUserCardPropType = {
    avatarUrl?: string | undefined,
    userName: string
}

export { EventUserCard }