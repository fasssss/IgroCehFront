import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ContentCopy, Person, Search } from '@mui/icons-material';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Chip, IconButton, TextField } from '@mui/material';
import { CommonButton } from 'root/shared/components/CommonButton';
import { CommonModal } from 'root/shared/components/CommonModal';
import { EVENT_STATUS, EVENT_STATUS_COLOR } from 'root/shared/constants';
import { RootState } from 'root/shared/store';
import './styles.scss';

const EventTile = ({ id, name, creatorUserName, statusId, startDate, endDate, participantsIds }: EventTilePropType) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const [eventToShare, setEventToShare] = useState({ eventLink: "" });
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const navigate = useNavigate();

    return(
        <div className='event-tile'>
            <div className='event-tile__left-side'>
                <div className='event-tile__title'>
                    {name} {statusId != null && <Chip sx={{fontSize: "medium"}} className='event-tile__chip' label={ t(EVENT_STATUS[statusId]) } color={EVENT_STATUS_COLOR[EVENT_STATUS[statusId]]} />}
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
                    EVENT_STATUS[statusId] !== 'Finished' && (
                        participantsIds?.some(id => id === userInfo.id) ?
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

type EventTilePropType = {
    id: string,
    name: string,
    creatorUserName: string,
    statusId: number
    startDate: Date,
    endDate: Date,
    participantsIds?: Array<string>
}

export { EventTile }