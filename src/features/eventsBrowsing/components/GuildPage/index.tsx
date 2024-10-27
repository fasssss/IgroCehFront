import { useParams } from "react-router-dom";
import { useGetGuildByIdQuery } from "../../eventsBrowserApi";
import { useEffect } from "react";

const GuildPage = () => {
    const { guildId } = useParams()
    const getGuildById = useGetGuildByIdQuery({ guildId: guildId });
    useEffect(() => {
        if(getGuildById.isSuccess) {
            
        }
    }, [getGuildById.isSuccess]);

    return (
        <div className="guild-page">
            <div className="guild-page__header">

            </div>
        </div>
    );
}

export { GuildPage }