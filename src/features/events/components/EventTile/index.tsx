import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ContentCopy, Person, Search } from '@mui/icons-material';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Chip, IconButton, TextField } from '@mui/material';
import { CommonButton } from 'root/shared/components/CommonButton';
import { CommonModal } from 'root/shared/components/CommonModal';
import { EVENT_STATUS_COLOR, EVENT_STATUS_NAME, EventStatus } from 'root/shared/constants';
import { useCurrentUser } from 'root/features/authorization/authorizationApi';
import { EventShortObject } from '../../eventsApi';
import './styles.scss';

const EventTile = ({ id, name, creatorUserName, statusId, startDate, endDate, participantsIds }: EventShortObject) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const [eventToShare, setEventToShare] = useState({ eventLink: "" });
    const currentUser = useCurrentUser();
    const navigate = useNavigate();

    return(
        <div className='event-tile'>
            <div className='event-tile__left-side'>
                <div className='event-tile__title'>
                    {name} {statusId != null && <Chip sx={{fontSize: "medium"}} className='event-tile__chip' label={ t(EVENT_STATUS_NAME[statusId]) } color={EVENT_STATUS_COLOR[statusId]} />}
                </div>
                <div className='event-tile__creator-name'>{ creatorUserName }</div>
            </div>
            <div className='event-tile__right-side'>
                <div className='event-tile__date-time'>
                    <CalendarMonthIcon />
                    {new Date(startDate).toLocaleString('default', { day: 'numeric', month: 'long' })}
                    &nbsp;-&nbsp;
                    {new Date(endDate).toLocaleString('default', { day: 'numeric', month: 'long' })}
                </div>
                <div className='event-tile__players-count'><Person /> { participantsIds?.length }</div>
                {
                    statusId === EventStatus.Finished ?
                    <div className='event-tile__buttons'>
                        <CommonButton color='success'
                        onClick={() => navigate(`/guild/${guildId}/event/${id}`)}
                        startIcon={<EmojiEventsIcon />}
                        >
                            { t('View results') }
                        </CommonButton>
                    </div>
                    : (
                        participantsIds?.some(participantId => participantId === currentUser?.id) ?
                        <div className='event-tile__buttons'>
                            <CommonButton color='success' 
                            onClick={() => setEventToShare({ eventLink: `${window.location.href}/event/${id}`} )} 
                            startIcon={<ShareIcon />}
                            >
                                { t('Share') }
                            </CommonButton>
                            <CommonButton color='success'
                            onClick={() => navigate(`/guild/${guildId}/event/${id}`)}
                            startIcon={<Search />}
                            >
                                { t('Inspect') }
                            </CommonButton>
                        </div>
                        :
                        <div className='event-tile__buttons'>
                            <CommonButton color='success' 
                            onClick={() => navigate(`/guild/${guildId}/event/${id}`)} 
                            startIcon={<PersonAddIcon />}
                            >
                                { t('Join') }
                            </CommonButton>
                        </div>
                    )
                }
            </div>
            {
                eventToShare.eventLink &&
                <CommonModal name={ t("Link to event") }
                    onClose={() => setEventToShare({ eventLink: "" })}
                >
                    <TextField value={eventToShare.eventLink} 
                        disabled
                        multiline
                        fullWidth variant="outlined"
                        label={ t('Link') }
                        slotProps={{
                            input: {
                                endAdornment: 
                                    <IconButton onClick={() => {navigator.clipboard.writeText(eventToShare.eventLink)}}>
                                        <ContentCopy />
                                    </IconButton>
                            }
                        }}
                    />
                </CommonModal>
            }
        </div>
    );
};

export { EventTile }