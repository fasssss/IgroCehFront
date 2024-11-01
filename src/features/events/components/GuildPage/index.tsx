import { useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useGetGuildByIdQuery, usePostNewEventMutation, useGetEventsByGuildIdQuery } from "../../eventsApi";
import { EventTile } from "../EventTile";
import './styles.scss';
import { useEffect, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

const GuildPage = () => {
    const { guildId } = useParams();
    const { t } = useTranslation();
    const getGuildById = useGetGuildByIdQuery({ guildId: guildId });
    const [postNewEvent, postNewEventResult] = usePostNewEventMutation();
    const getEventsList = useGetEventsByGuildIdQuery({ guildId: guildId }); 
    const [isCreateNewOpened, setIsCreateNewOpened] = useState(false);
    const [eventToCreate, setEventToCreate] = useState({ eventName: "" });

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