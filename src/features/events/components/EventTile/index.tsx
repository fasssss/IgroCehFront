import { Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { CommonButton } from 'root/shared/components/CommonButton';
import ShareIcon from '@mui/icons-material/Share';
import { EVENT_STATUS, EVENT_STATUS_COLOR } from 'root/shared/constants';
import './styles.scss';
import { useTranslation } from 'react-i18next';

const EventTile = ({ name, creatorName, statusCode, startDate, endDate }: EventTilePropType) => {
    const { t } = useTranslation();

    return(
        <div className='event-tile'>
            <div className='event-tile__left-side'>
                <div className='event-tile__title'>
                    {name} {statusCode != null && <Chip className='event-tile__chip' label={ t(EVENT_STATUS[statusCode]) } color={EVENT_STATUS_COLOR[EVENT_STATUS[statusCode]]} />}
                </div>
                <div className='event-tile__creator-name'>{ creatorName }</div>
            </div>
            <div className='event-tile__right-side'>
                <div className='event-tile__date-time'>
                    <CalendarMonthIcon />
                    {new Date(startDate).toLocaleString('default', { day: 'numeric', month: 'long' })}
                    &nbsp;-&nbsp;
                    {new Date(endDate).toLocaleString('default', { day: 'numeric', month: 'long' })}</div>
                <div className='event-tile__players-count'></div>
                <div className='event-tile__button'>
                    <CommonButton color='success' startIcon={<ShareIcon />}>{ t('Share') }</CommonButton>
                </div>
            </div>
        </div>
    );
};

type EventTilePropType = {
    name: string,
    creatorName: string,
    statusCode: number
    startDate: Date,
    endDate: Date
}

export { EventTile }