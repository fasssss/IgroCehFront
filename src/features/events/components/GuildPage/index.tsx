import { useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useGetGuildByIdQuery, usePostNewEventMutation, useGetEventsByGuildIdQuery } from "../../eventsApi";
import { EventTile } from "../EventTile";
import './styles.scss';
import { useEffect, useState } from "react";
import { CircularProgress, Fab, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useOnMount } from "root/shared/hooks/useOnMount";

const GuildPage = () => {
    const { guildId } = useParams();
    const { t } = useTranslation();
    const getGuildById = useGetGuildByIdQuery({ guildId: guildId });
    const [postNewEvent, postNewEventResult] = usePostNewEventMutation();
    const getEventsList = useGetEventsByGuildIdQuery({ guildId: guildId }); 
    const [isCreateNewOpened, setIsCreateNewOpened] = useState(false);
    const [eventToCreate, setEventToCreate] = useState({ eventName: "" });
    const [isScrollUpButtonShown, setIsScrollUpButtonShown] = useState(false);

    useOnMount(() => {
        const handleScroll = () => {
            if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
                setIsScrollUpButtonShown(true);
            } else {
                setIsScrollUpButtonShown(false);
            }
        };

        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    });

    useEffect(() => {
        if(postNewEventResult.isSuccess){
            console.log(getEventsList.data);
        }
    }, [postNewEventResult.isSuccess]);

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
                </div>
            </div>
            <div className="guild-page__body">
                {
                    postNewEventResult.isLoading || getEventsList.isFetching ?
                    <CircularProgress color="primary"/>
                    :
                    getEventsList.data?.eventsList.map((value) => {
                        return(
                            <EventTile key={value.id}
                             name={value.name} 
                             creatorName={value.creatorUserName} 
                             statusCode={value.statusId} 
                             startDate={value.startDate}
                             endDate={value.endDate}
                            />
                        );
                    })
                }
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
                <CommonModal name="Create new event" 
                    onClose={() => setIsCreateNewOpened(false)} 
                    onConfirm={() => {
                        postNewEvent({ guildId: guildId, eventName: eventToCreate.eventName });
                        setIsCreateNewOpened(false);
                    }}
                >
                    <TextField value={eventToCreate.eventName} 
                        onChange={(e) => setEventToCreate({ eventName: e.target.value })} 
                        fullWidth variant="outlined" 
                        label="Event name" 
                    />
                </CommonModal>
            }
        </div>
    );
}

export { GuildPage }