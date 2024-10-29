import { useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonModal } from "root/shared/components/CommonModal";
import { useGetGuildByIdQuery, usePostNewEventMutation } from "../../eventsApi";
import { EventTile } from "../EventTile";
import './styles.scss';
import { useState } from "react";
import { TextField } from "@mui/material";

const GuildPage = () => {
    const { guildId } = useParams()
    const getGuildById = useGetGuildByIdQuery({ guildId: guildId });
    const [postNewEvent] = usePostNewEventMutation();
    const [isCreateNewOpened, setIsCreateNewOpened] = useState(false);
    const [eventToCreate, setEventToCreate] = useState({ eventName: "" });

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
                        Create event
                    </CommonButton>
                </div>
            </div>
            <div className="guild-page__body">
                <EventTile />
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