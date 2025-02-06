import { useNavigate, useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useEffect, useState } from "react";
import { CircularProgress, Fab, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useOnMount } from "root/shared/hooks/useOnMount";
import { useGetGuildByIdQuery, 
    usePostNewEventMutation, 
    useLazyGetEventsByGuildIdQuery } from "../../eventsApi";
import { EventTile } from "../EventTile";
import './styles.scss';

const GuildPage = () => {
    const { guildId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const getGuildById = useGetGuildByIdQuery({ guildId: guildId });
    const [postNewEvent, postNewEventResult] = usePostNewEventMutation();
    const [getEventsList, eventsList] = useLazyGetEventsByGuildIdQuery();
    const [isCreateNewOpened, setIsCreateNewOpened] = useState(false);
    const [eventToCreate, setEventToCreate] = useState({ eventName: "" });
    const [isScrollUpButtonShown, setIsScrollUpButtonShown] = useState(false);
    const [isScrolledDown, setIsScrolledDown] = useState(false);

    let webSock = new WebSocket('wss://igroceh.xyz:60444/api/ws');

    useEffect(() => {
        console.log(webSock.readyState);
    }, [webSock.readyState]);

    useOnMount(() => {
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
    });

    useEffect(() => {
        getEventsList({ guildId: guildId, skip: 0, clearCache: true })
    }, []);

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

    useEffect(() => {
        if(postNewEventResult.isSuccess || postNewEventResult.isError){
            navigate(`/guild/${guildId}/event/${postNewEventResult.data?.eventId}`);
        }
    }, [postNewEventResult.isSuccess, postNewEventResult.isError]);

    return (
        <div className="guild-page">
            <div className="guild-page__header">
                {
                    getGuildById.isSuccess &&
                    <div className="guild-page__guild-badge">
                        <img src={getGuildById.data.guildObject.iconUrl} className="guild-page__guild-icon" />
                        <div className="guild-page__guild-name">{getGuildById.data.guildObject.name}</div>
                    </div>
                }
                <div className="guild-page__actions">
                    <CommonButton color="success" onClick={() => setIsCreateNewOpened(true)} startIcon={<AddIcon />}>
                        {t("Create event")}
                    </CommonButton>
                    <CommonButton color="success" onClick={() => navigate(`/guild/${guildId}/leader-board`)}>
                        {t("See leader board")}
                    </CommonButton>
                </div>
            </div>
            <div className="guild-page__body">
                {
                    eventsList.data?.eventsList?.map((value) => {
                        return(
                            <EventTile key={value.id} 
                            {...value}
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
                    onClose={() => setIsCreateNewOpened(false)} 
                    onConfirm={() => {
                        postNewEvent({ guildId: guildId, eventName: eventToCreate.eventName });
                    }}
                >
                    {
                        !postNewEventResult.isLoading ?
                        <TextField value={eventToCreate.eventName} 
                        onChange={(e) => setEventToCreate({ eventName: e.target.value })} 
                        fullWidth variant="outlined" 
                        label={ t("Event name") } 
                        />
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