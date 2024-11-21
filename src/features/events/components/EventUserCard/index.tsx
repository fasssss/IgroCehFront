import Tilt from 'react-parallax-tilt';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Logout } from '@mui/icons-material';
import { RootState } from 'root/shared/store';
import { CommonButton } from 'root/shared/components/CommonButton';
import { useGetEventByIdQuery, useRemoveFromEventMutation } from '../../eventsApi';
import './styles.scss';

const EventUserCard = ({ avatarUrl, userName, userId }: EventUserCardPropType) => {
    const { eventId } = useParams();
    const getEventById = useGetEventByIdQuery({ eventId });
    const authorizedUserInfo = useSelector((state: RootState) => state.authorizationReducer);
    const [removeFromEvent] = useRemoveFromEventMutation();

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
            <div className="user-card__body">
                {
                    getEventById.data?.eventCreatorId === authorizedUserInfo.id && 
                    getEventById.data?.eventCreatorId !== userId &&
                    <CommonButton 
                    onClick={() => removeFromEvent({ userId: userId || "", eventId: eventId || "" })} 
                    color="error" 
                    endIcon={<Logout />}>
                        Kick from event
                    </CommonButton> 
                }
            </div>
        </Tilt>
    );
}

type EventUserCardPropType = {
    avatarUrl?: string | undefined,
    userName: string,
    userId: string
}

export { EventUserCard }