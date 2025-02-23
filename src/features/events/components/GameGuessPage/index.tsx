import { useNavigate, useParams } from "react-router-dom";
import { 
    useCreateGameMutation,
    useLazyFindGameByNameQuery,
    useLazyGetEventByIdQuery,
    useSuggestGameMutation
} from "../../eventsApi";
import { useSelector } from "react-redux";
import { RootState } from "root/shared/store";
import './styles.scss';
import { SearchBar } from "root/shared/components/SearchBar";
import { useTranslation } from "react-i18next";
import { CommonButton } from "root/shared/components/CommonButton";
import { useEffect, useState } from "react";
import { CommonField } from "root/shared/components/CommonField";
import { DragNDropImage } from "root/shared/components/DragNDropImage";
import { CommonModal } from "root/shared/components/CommonModal";
import { EVENT_STATUS } from "root/shared/constants";

const GameGuessPage = () => {
    const { guildId, eventId } = useParams();
    const { t } = useTranslation();
    const [getEventById, eventById] = useLazyGetEventByIdQuery();
    const [findGameByName, findGameByNameResult] = useLazyFindGameByNameQuery();
    const [createGame, createGameResult] = useCreateGameMutation();
    const [suggestGame, suggestGameResult] = useSuggestGameMutation();
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const selectedRecord = eventById.data?.eventRecords.find(record => record.participant.id === userInfo.id);
    const [isSearchInSteam, setIsSearchInSteam] = useState(true);
    const [gameName, setGameName] = useState("");
    const [thisGameAlreadyExistModal, setThisGameAlreadyExistModal] = useState(false);
    const [imgBlob, setImgBlob] = useState<Blob>();
    const [imgUrlObject] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        getEventById({ eventId })
    }, [])

    useEffect(() => {
        if(eventById.isSuccess && !eventById.isFetching) {
            const isUserAlreadySuggestedGame = eventById.data?.eventRecords
            .find(record => record.participant.id == userInfo.id && record.game);
            switch (eventById.data?.statusId) {
                case EVENT_STATUS.indexOf('Players registration'):
                    navigate(`/guild/${guildId}/event/${eventId}`);
                    break;
                case EVENT_STATUS.indexOf('Players shuffle'):
                    console.log(eventById.data);
                    navigate(`/guild/${guildId}/event/${eventId}/ordering-stage`);
                    break;
                case EVENT_STATUS.indexOf('Active'):
                    navigate(`/guild/${guildId}/event/${eventId}/active-stage`);
                    break;
            }
    
            if(isUserAlreadySuggestedGame) {
                navigate(`/guild/${guildId}/event/${eventId}/active-stage`);
            }
        }
    }, [eventById.isFetching]);

    useEffect(() => {
        if(!createGameResult.isLoading && 
            createGameResult.isSuccess
        ) {
            suggestGame({ 
                gameId: createGameResult.data.gameId, 
                eventRecordId: eventById.data?.eventRecords
                .find(record => record.participant.id == userInfo.id)?.id || "",
                eventId: eventId || ""
            });
        }
    }, [createGameResult.isLoading]);

    useEffect(() => {
        if(!findGameByNameResult.isFetching && 
            findGameByNameResult.isSuccess && 
            !findGameByNameResult.data.gameObject?.id
        ) {
            const formData = new FormData();
            formData.append("image", imgBlob || new Blob());
            formData.append("eventRecordId", selectedRecord?.id || "");
            formData.append("gameName", gameName);
            createGame({ 
                data: formData
            });
        }

        if(!findGameByNameResult.isFetching && 
            findGameByNameResult.isSuccess && 
            findGameByNameResult.data.gameObject?.id
        ) {
            setThisGameAlreadyExistModal(true);
        }
    }, [findGameByNameResult.isFetching]);

    useEffect(() => {
        if(suggestGameResult.isSuccess) {
            navigate(`/guild/${guildId}/event/${eventId}/active-stage`);
        }
    }, [suggestGameResult.isLoading])

    return(
    <div className="game-guess">
        <div className="game-guess__header">
            {
                eventById.data &&
                <div className="game-guess__user-plate">
                    <img src={selectedRecord?.toUser?.avatarUrl} className="game-guess__user-image" />
                    {selectedRecord?.toUser?.userName}
                </div>
            }
        </div>
        <div className="game-guess__body">
            <div className="game-guess__body-buttons">
                <CommonButton
                disabled={isSearchInSteam}
                onClick={() => setIsSearchInSteam(true)}>
                    Search in Steam
                </CommonButton>
                <CommonButton
                disabled={!isSearchInSteam}
                onClick={() => setIsSearchInSteam(false)}>
                    Create custom
                </CommonButton>
            </div>
            {
                isSearchInSteam ?
                <SearchBar 
                placeholder= {t("Search in Steam")}
                onTyping={undefined} 
                isFetchingResult={true} 
                handleOptionClick={() => {}} 
                optionsSelect={undefined} />
                :
                <div className="game-guess__custom-game">
                    <DragNDropImage value={imgBlob} stateMutator={setImgBlob} />
                    <br />
                    <CommonField 
                    placeholder="Enter game name..."
                    value={gameName}
                    className="game-guess__name-field"
                    onChange={(e) => { setGameName(e.target.value) }} />
                    <div className="game-guess__custom-game-submit">
                        <CommonButton 
                        onClick={ () => {
                            findGameByName({ name: gameName }, false);
                        }} 
                        color="success">
                            Suggest game
                        </CommonButton>
                    </div>
                    {
                        thisGameAlreadyExistModal &&
                        <CommonModal 
                        name={"Game with such name already exist"} 
                        onClose={() => {
                            const formData = new FormData();
                            formData.append("image", imgBlob || new Blob());
                            formData.append("eventRecordId", selectedRecord?.id || "");
                            formData.append("gameName", gameName);
                            createGame({ 
                                data: formData
                            });
                            setThisGameAlreadyExistModal(false);
                        }}
                        onCloseText="Create new one"
                        onConfirmText="Continue with existing"
                        onConfirm={() => {
                            suggestGame({ 
                                gameId: findGameByNameResult.data?.gameObject?.id || "", 
                                eventRecordId: eventById.data?.eventRecords
                                .find(record => record.participant.id == userInfo.id)?.id || "",
                                eventId: eventId || ""
                            });
                            setThisGameAlreadyExistModal(false);
                        }}>
                            <div className="create-additional-modal">
                                <h3>👉{findGameByNameResult.data?.gameObject?.name}👈</h3>
                                <img src={imgUrlObject} />
                            </div>
                        </CommonModal>
                    }
                </div>
            }
        </div>
    </div>
    );   
}

export { GameGuessPage }