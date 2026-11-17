import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { EventPeriodLimits, EventPeriodQuickEnd } from "../../eventsApi";
import './styles.scss';

type Edge = 'start' | 'end';

// the dates here are only drawn: "yyyy-mm-dd" days at 00:00 UTC, as the seasons, compared as text;
// which days can be picked, the quick lengths and today come from the server (getEventPeriodLimits)
const toDate = (day: string) => new Date(`${day}T00:00:00Z`);

const pad = (value: number) => String(value).padStart(2, '0');

// the days of a "yyyy-mm" month and how many cells of a week starting on Monday come before its 1st
const daysOfMonth = (month: string) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const blanks = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
    return { blanks, days: Array.from({ length: count }, (_, index) => `${month}-${pad(index + 1)}`) };
};

const shiftMonth = (month: string, by: number) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(Date.UTC(year, monthNumber - 1 + by, 1));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// two cards of the start and the end, and the calendar of the card in work; after the start is picked the end is in work
const EventPeriodPicker = ({ start, end, limits, lastLimits, isStartWrong, isEndWrong, onChange }: EventPeriodPickerProps) => {
    const { t, i18n } = useTranslation();
    const [edge, setEdge] = useState<Edge>('start');
    const [month, setMonth] = useState(() => start.slice(0, 7));
    const pickerRef = useRef<HTMLDivElement>(null);

    // the picker opens at the bottom of the modal, its calendar is brought into sight
    useEffect(() => {
        pickerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, []);
    const format = (day: string, options: Intl.DateTimeFormatOptions) =>
        toDate(day).toLocaleString(i18n.language, { ...options, timeZone: 'UTC' });
    // the month as it reads after a day number, "ноября" in Russian
    const monthAfterDay = (day: string) => new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', timeZone: 'UTC' })
        .formatToParts(toDate(day)).find(part => part.type === 'month')?.value ?? '';
    // 2024-01-01 is a Monday
    const weekdays = Array.from({ length: 7 }, (_, index) => capitalize(format(`2024-01-0${index + 1}`, { weekday: 'short' })));
    // the bounds of the start don't depend on the picked start, the last known ones do while the new ones load
    const bounds = edge === 'start'
        ? lastLimits && { earliest: lastLimits.earliestStart, latest: lastLimits.latestStart }
        : limits && { earliest: limits.earliestEnd, latest: limits.latestEnd };
    const canPick = (day: string) => !!bounds && day >= bounds.earliest && day <= bounds.latest;
    const { blanks, days } = daysOfMonth(month);
    const length = Math.round((toDate(end).getTime() - toDate(start).getTime()) / 86_400_000);

    const work = (nextEdge: Edge, day: string) => {
        setEdge(nextEdge);
        setMonth(day.slice(0, 7));
    };

    const pick = (day: string) => {
        if(edge === 'start') {
            onChange({ start: day, end });
            work('end', end);
        } else {
            onChange({ start, end: day });
        }
    };

    const pickQuick = (quick: EventPeriodQuickEnd) => {
        onChange({ start, end: quick.end });
        work('end', quick.end);
    };

    const quickLabel = (quick: EventPeriodQuickEnd) => quick.months
        ? t('{{count}} months', { count: quick.months })
        : quick.days && quick.days % 7 === 0 ? t('{{count}} weeks', { count: quick.days / 7 }) : t('{{count}} days', { count: quick.days ?? 0 });

    const renderCard = (cardEdge: Edge, day: string, isWrong: boolean) => (
        <button
        type="button"
        className={`event-period-picker__card${edge === cardEdge ? ' event-period-picker__card--active' : ''}${isWrong ? ' event-period-picker__card--wrong' : ''}`}
        aria-pressed={edge === cardEdge}
        onClick={() => work(cardEdge, day)}
        >
            <span className="event-period-picker__card-label">{t(cardEdge === 'start' ? 'Start of the event' : 'End of the event')}</span>
            <span className="event-period-picker__card-day">{format(day, { day: 'numeric' })}</span>
            <span className="event-period-picker__card-month">
                {monthAfterDay(day)} {day.slice(0, 4)}, {format(day, { weekday: 'short' })}
            </span>
        </button>
    );

    return (
        <div className="event-period-picker" ref={pickerRef}>
            <div className="event-period-picker__cards">
                {renderCard('start', start, isStartWrong)}
                <div className="event-period-picker__length">
                    <ArrowForwardIcon fontSize="small" />
                    {length > 0 && t('{{count}} days', { count: length })}
                </div>
                {renderCard('end', end, isEndWrong)}
            </div>
            {
                limits && edge === 'end' &&
                <div className="event-period-picker__quick">
                    {
                        limits.quickEnds.map(quick =>
                            <button
                            key={quick.end}
                            type="button"
                            className={`event-period-picker__chip${quick.end === end ? ' event-period-picker__chip--active' : ''}`}
                            onClick={() => pickQuick(quick)}
                            >
                                {quickLabel(quick)}
                            </button>
                        )
                    }
                </div>
            }
            <div className="event-period-picker__calendar">
                <div className="event-period-picker__caption">{t(edge === 'start' ? 'Pick the start date' : 'Pick the end date')}</div>
                <div className="event-period-picker__month">
                    <button
                    type="button"
                    className="event-period-picker__nav"
                    aria-label={t('Previous month')}
                    disabled={!!bounds && month <= bounds.earliest.slice(0, 7)}
                    onClick={() => setMonth(shiftMonth(month, -1))}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <span>{capitalize(format(`${month}-01`, { month: 'long' }))} {month.slice(0, 4)}</span>
                    <button
                    type="button"
                    className="event-period-picker__nav"
                    aria-label={t('Next month')}
                    disabled={!!bounds && month >= bounds.latest.slice(0, 7)}
                    onClick={() => setMonth(shiftMonth(month, 1))}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
                <div className="event-period-picker__grid">
                    {weekdays.map(weekday => <div key={weekday} className="event-period-picker__weekday">{weekday}</div>)}
                    {Array.from({ length: blanks }, (_, index) => <div key={`blank-${index}`} />)}
                    {
                        days.map(day => {
                            const isEdge = day === start || day === end;
                            const classes = ['event-period-picker__day'];
                            if(isEdge) {
                                classes.push('event-period-picker__day--edge');
                            } else if(day > start && day < end) {
                                classes.push('event-period-picker__day--in-period');
                            }

                            if(day === lastLimits?.earliestStart) {
                                classes.push('event-period-picker__day--today');
                            }

                            return (
                                <button
                                key={day}
                                type="button"
                                className={classes.join(' ')}
                                disabled={!canPick(day)}
                                aria-pressed={day === (edge === 'start' ? start : end)}
                                aria-label={format(day, { day: 'numeric', month: 'long', year: 'numeric' })}
                                onClick={() => pick(day)}
                                >
                                    {Number(day.slice(8))}
                                </button>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
};

type EventPeriodPickerProps = {
    start: string,
    end: string,
    // the bounds for the picked start, missing while they load
    limits?: EventPeriodLimits,
    // the bounds that came last, for the start and today
    lastLimits?: EventPeriodLimits,
    isStartWrong: boolean,
    isEndWrong: boolean,
    onChange: (dates: { start: string, end: string }) => void
}

export { EventPeriodPicker }
