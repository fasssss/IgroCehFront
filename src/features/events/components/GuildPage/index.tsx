import { useNavigate, useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useEffect, useState } from "react";
import { CircularProgress, Fab, FormControlLabel, Switch, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useGetGuildByIdQuery } from "root/features/guilds/guildsApi";
import { usePostNewEventMutation,
    useGetEventSeasonsQuery,
    useLazyGetEventsByGuildIdQuery } from "../../eventsApi";
import { EventTile } from "../EventTile";
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

    // without the seasons the switch isn't shown, and the server takes the season it offers
    const createEvent = async () => {
        const { eventId } = await postNewEvent({ guildId, ...eventToCreate, isNextSeason: season ? isNextSeason : undefined }).unwrap();
        navigate(`/guild/${guildId}/event/${eventId}`);
    };

    const closeCreation = () => {
        setIsCreateNewOpened(false);
        setIsNextSeasonChosen(null);
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
                                    control={
                                        <Switch
                                        checked={isNextSeason}
                                        onChange={(e) => setIsNextSeasonChosen(e.target.checked)} />
                                    }
                                    label={t("Plan for the next season")} />
                                    <div className="guild-page__create-event-hint">
                                        {
                                            isNextSeason ?
                                            t("The season of the event is {{start}} – {{end}}. The registration lasts until it starts.", seasonDates)
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