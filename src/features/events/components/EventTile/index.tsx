import { Chip, IconButton, TextField } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler, useState } from 'react';
import { ContentCopy } from '@mui/icons-material';
import { CommonButton } from 'root/shared/components/CommonButton';
import { CommonModal } from 'root/shared/components/CommonModal';
import ShareIcon from '@mui/icons-material/Share';
import { EVENT_STATUS, EVENT_STATUS_COLOR } from 'root/shared/constants';
import './styles.scss';

const EventTile = ({ id, name, creatorUserName, statusId, startDate, endDate }: EventTilePropType) => {
    const { t } = useTranslation();
    const [eventToShare, setEventToShare] = useState({ eventLink: "" });

    return(
        <div className='event-tile'>
            <div className='event-tile__left-side'>
                <div className='event-tile__title'>
                    {name} {statusId != null && <Chip className='event-tile__chip' label={ t(EVENT_STATUS[statusId]) } color={EVENT_STATUS_COLOR[EVENT_STATUS[statusId]]} />}
                </div>
                <div className='event-tile__creator-name'>{ creatorUserName }</div>
            </div>
            <div className='event-tile__right-side'>
                <div className='event-tile__date-time'>
                    <CalendarMonthIcon />
                    {new Date(startDate).toLocaleString('default', { day: 'numeric', month: 'long' })}
                    &nbsp;-&nbsp;
                    {new Date(endDate).toLocaleString('default', { day: 'numeric', month: 'long' })}</div>
                <div className='event-tile__players-count'></div>
                <div className='event-tile__button'>
                    {
                        EVENT_STATUS[statusId] === 'Players registration' &&
                        <CommonButton color='success' 
                        onClick={() => setEventToShare({ eventLink: `${window.location.href}/join/${id}`} )} 
                        startIcon={<ShareIcon />}
                        >
                            { t('Share') }
                        </CommonButton>
                    }
                </div>
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
    id: string
    name: string,
    creatorUserName: string,
    statusId: number
    startDate: Date,
    endDate: Date,
    onButtonClick?: MouseEventHandler<HTMLButtonElement>
}

export { EventTile }