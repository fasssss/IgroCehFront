import { useNavigate, useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useEffect, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Button, CircularProgress, Fab, FormControlLabel, Switch, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useGetGuildByIdQuery } from "root/features/guilds/guildsApi";
import { usePostNewEventMutation,
    useGetEventSeasonsQuery,
    useGetEventPeriodLimitsQuery,
    useLazyGetEventPeriodLimitsQuery,
    useLazyGetEventsByGuildIdQuery } from "../../eventsApi";
import { EventTile } from "../EventTile";
import { EventPeriodPicker } from "../EventPeriodPicker";
import { formatSeasonDate } from "../../seasons";
import './styles.scss';

const GuildPage = () => {
    const { guildId = "" } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const getGuildById = useGetGuildByIdQuery({ guildId });
    const [postNewEvent, postNewEventResult] = usePostNewEventMutation();
    const [getEventsList, eventsList] = useLazyGetEventsByGuildIdQuery();
    const [isCreateNewOpened, setIsCreateNewOpened] = useState(false);
    const [eventToCreate, setEventToCreate] = useState({ eventName: "", allowsNewcomers: true });
    // asked on every opening of the creation, the seasons move on with the months
    const eventSeasons = useGetEventSeasonsQuery(isCreateNewOpened ? undefined : skipToken);
    // until the creator touches the switch it shows the season the server offers
    const [isNextSeasonChosen, setIsNextSeasonChosen] = useState<boolean | null>(null);
    const isNextSeason = isNextSeasonChosen ?? eventSeasons.data?.isNextByDefault ?? false;
    const season = eventSeasons.data && (isNextSeason ? eventSeasons.data.next : eventSeasons.data.current);
    const seasonDates = season && { start: formatSeasonDate(season.start, i18n.language), end: formatSeasonDate(season.end, i18n.language) };
    // the advanced options: own dates of the event instead of the season, "yyyy-mm-dd" days;
    // the server gives their bounds as days for the picked start, the front only compares with them
    const [isAdvancedShown, setIsAdvancedShown] = useState(false);
    const [ownDates, setOwnDates] = useState<{ start: string, end: string } | null>(null);
    const [getPeriodLimits] = useLazyGetEventPeriodLimitsQuery();
    const periodLimitsQuery = useGetEventPeriodLimitsQuery(ownDates?.start ? { startDate: ownDates.start } : skipToken);
    // the bounds of another start don't count while the ones of the picked start load, the last ones still draw the calendar
    const limits = periodLimitsQuery.currentData;
    const lastLimits = periodLimitsQuery.data;
    const isStartValid = !!ownDates?.start && !!limits && ownDates.start >= limits.earliestStart && ownDates.start <= limits.latestStart;
    const isEndValid = !!ownDates?.end && !!limits && ownDates.end >= limits.earliestEnd && ownDates.end <= limits.latestEnd;
    const [isScrollUpButtonShown, setIsScrollUpButtonShown] = useState(false);
    const [isScrolledDown, setIsScrolledDown] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (document.documentElement.scrollTop > 1000) {
                setIsScrollUpButtonShown(true);
            } else {
                setIsScrollUpButtonShown(false);
            }

            const isScrolledBottom = Math.abs(
                document.documentElement.scrollHeight - 
                document.documentElement.clientHeight - 
                document.documentElement.scrollTop
            ) < 1

            if(isScrolledBottom) {
                setIsScrolledDown(true);
            } else {
                setIsScrolledDown(false);
            }
        };

        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        getEventsList({ guildId: guildId, skip: 0, clearCache: true })
    }, [getEventsList, guildId]);

    useEffect(() => {
        if(eventsList.isSuccess || eventsList.isError){
            setIsScrolledDown(false);
        }
    }, [eventsList.isFetching]);

    useEffect(() => {
        if(!eventsList.isUninitialized && isScrolledDown){
            getEventsList({ guildId: guildId, clearCache: false, skip: eventsList.data?.eventsList.length || 0 })
        }
    }, [isScrolledDown]);

    // without the seasons the switch isn't shown, and the server takes the season it offers; own dates replace the season
    const createEvent = async () => {
        const dates = ownDates ? { startDate: ownDates.start, endDate: ownDates.end } : { isNextSeason: season ? isNextSeason : undefined };
        try {
            const { eventId } = await postNewEvent({ guildId, ...eventToCreate, ...dates }).unwrap();
            navigate(`/guild/${guildId}/event/${eventId}`);
        } catch {
            // the form says the event wasn't created
        }
    };

    // the own dates start as the chosen season, moved into the bounds the server gives; the days of the season are
    // the dates of its "yyyy-mm-ddT00:00:00+00:00"
    const switchOwnDates = async (isOn: boolean) => {
        if(!isOn || !season) {
            setOwnDates(null);
            return;
        }

        const within = (day: string, earliest: string, latest: string) => day < earliest ? earliest : day > latest ? latest : day;
        try {
            const seasonLimits = await getPeriodLimits({ startDate: season.start.slice(0, 10) }).unwrap();
            const start = within(seasonLimits.startDate, seasonLimits.earliestStart, seasonLimits.latestStart);
            const startLimits = start === seasonLimits.startDate ? seasonLimits : await getPeriodLimits({ startDate: start }).unwrap();
            setOwnDates({ start, end: within(season.end.slice(0, 10), startLimits.earliestEnd, startLimits.latestEnd) });
        } catch {
            // without the bounds the own dates aren't offered, the switch stays off
        }
    };

    const closeCreation = () => {
        setIsCreateNewOpened(false);
        setIsNextSeasonChosen(null);
        setIsAdvancedShown(false);
        setOwnDates(null);
    };

    return (
        <div className="guild-page">
            <div className="guild-page__header">
                {
                    getGuildById.isSuccess &&
                    <div className="guild-page__guild-badge">
                        <img src={getGuildById.data.guildObject.iconUrl ?? undefined} className="guild-page__guild-icon" />
                        <div className="guild-page__guild-name">{getGuildById.data.guildObject.name}</div>
                    </div>
                }
                <div className="guild-page__actions">
                    <CommonButton color="success" onClick={() => setIsCreateNewOpened(true)} startIcon={<AddIcon />}>
                        {t("Create event")}
                    </CommonButton>
                    <CommonButton color="success" onClick={() => navigate(`/guild/${guildId}/leader-board`)}>
                        {t("See leaderboard")}
                    </CommonButton>
                </div>
            </div>
            <div className="guild-page__body">
                {
                    eventsList.data?.eventsList?.map((value) => {
                        return(
                            <EventTile key={value.id} 
                            {...value}
                            canDelete={getGuildById.data?.guildObject.isCurrentUserAdmin}
                            />
                        );
                    })
                }
                <div className="guild-page__body-loader">
                    {
                        (postNewEventResult.isLoading || eventsList.isFetching) &&
                        <CircularProgress color="primary"/>
                    }
                </div>
            </div>
                <div className="guild-page__to-top-button" 
                    style={isScrollUpButtonShown ? {opacity: 1, bottom: '8px'} : {}} 
                    onClick={() => document.documentElement.scrollTop = 0}>
                    <Fab color="primary">
                        <KeyboardDoubleArrowUpIcon />
                    </Fab>
                </div>
            {
                isCreateNewOpened &&
                <CommonModal name={ t("Create new event") }
                    onClose={closeCreation}
                    onConfirm={createEvent}
                    isConfirmDisabled={!!ownDates && !(isStartValid && isEndValid)}
                >
                    {
                        !postNewEventResult.isLoading ?
                        <div className="guild-page__create-event-form">
                            <TextField value={eventToCreate.eventName} 
                            onChange={(e) => setEventToCreate({ ...eventToCreate, eventName: e.target.value })} 
                            fullWidth variant="outlined" 
                            label={ t("Event name") }
                            />
                            {
                                seasonDates ?
                                <>
                                    <FormControlLabel
                                    disabled={!!ownDates}
                                    control={
                                        <Switch
                                        checked={isNextSeason}
                                        onChange={(e) => setIsNextSeasonChosen(e.target.checked)} />
                                    }
                                    label={t("Plan for the next season")} />
                                    <div className="guild-page__create-event-hint">
                                        {
                                            ownDates ?
                                            t("The event has its own dates instead of a season")
                                            :
                                            isNextSeason ?
                                            t("The season of the event is {{start}} – {{end}}. The event can be activated once it starts.", seasonDates)
                                            :
                                            t("The season of the event is {{start}} – {{end}}. Points for passing are counted from its start.", seasonDates)
                                        }
                                    </div>
                                </>
                                :
                                eventSeasons.isFetching &&
                                <div className="guild-page__create-event-spinner">
                                    <CircularProgress size={24} color="primary" />
                                </div>
                            }
                            <FormControlLabel
                            control={
                                <Switch
                                checked={eventToCreate.allowsNewcomers}
                                onChange={(e) => setEventToCreate({ ...eventToCreate, allowsNewcomers: e.target.checked })} />
                            }
                            label={t("Newcomers can join")} />
                            <div className="guild-page__create-event-hint">
                                {t("Participants fill a pool of games during the registration, and new players can join after the start.")}
                            </div>
                            {
                                season &&
                                <div className="guild-page__create-event-advanced">
                                    <Button
                                    color="inherit"
                                    className="guild-page__create-event-advanced-toggle"
                                    endIcon={isAdvancedShown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    onClick={() => setIsAdvancedShown(!isAdvancedShown)}
                                    >
                                        {t("Advanced options")}
                                    </Button>
                                    {
                                        isAdvancedShown &&
                                        <>
                                            <div className="guild-page__create-event-warning">
                                                {t("Change the dates of the event only for a good reason and after thinking it over: they set when the event can be activated and how many points the passing gives.")}
                                            </div>
                                            <FormControlLabel
                                            control={
                                                <Switch
                                                checked={!!ownDates}
                                                onChange={(e) => switchOwnDates(e.target.checked)} />
                                            }
                                            label={t("Own dates of the event")} />
                                            {
                                                ownDates &&
                                                <>
                                                    <EventPeriodPicker
                                                    start={ownDates.start}
                                                    end={ownDates.end}
                                                    limits={limits}
                                                    lastLimits={lastLimits}
                                                    isStartWrong={!!limits && !isStartValid}
                                                    isEndWrong={!!limits && !isEndValid}
                                                    onChange={setOwnDates}
                                                    />
                                                    {
                                                        limits && !isStartValid &&
                                                        <div className="guild-page__create-event-error">
                                                            {t("The start is from today and up to {{months}} months ahead", { months: limits.maxStartMonths })}
                                                        </div>
                                                    }
                                                    {
                                                        limits && isStartValid && !isEndValid &&
                                                        <div className="guild-page__create-event-error">
                                                            {t("The event lasts from {{days}} days to {{months}} months", { days: limits.minDays, months: limits.maxMonths })}
                                                        </div>
                                                    }
                                                    <div className="guild-page__create-event-hint">
                                                        {t("The event can be activated from its start. The period is split into three equal parts: passing in the first one gives 3 points, in the second 2, in the third 1, after the end 0.")}
                                                    </div>
                                                </>
                                            }
                                        </>
                                    }
                                </div>
                            }
                            {
                                postNewEventResult.isError &&
                                <div className="guild-page__create-event-error">{t("Couldn't create the event, try again")}</div>
                            }
                        </div>
                        :
                        <div className="guild-page__create-event-spinner">
                            <CircularProgress color="primary" />
                        </div>
                    }
                </CommonModal>
            }
        </div>
    );
}

export { GuildPage }