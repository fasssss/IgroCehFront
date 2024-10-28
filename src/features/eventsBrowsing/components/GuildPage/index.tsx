import { useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import { CommonButton } from "root/shared/components/CommonButton";
import { useGetGuildByIdQuery } from "../../eventsBrowserApi";
import './styles.scss';

const GuildPage = () => {
    const { guildId } = useParams()
    const getGuildById = useGetGuildByIdQuery({ guildId: guildId });

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
                    <CommonButton color="success" startIcon={<AddIcon />}>
                        Create event
                    </CommonButton>
                </div>
            </div>
            <div className="guild-page__body">

            </div>
        </div>
    );
}

export { GuildPage }