import { useParams } from "react-router-dom";
import { 
    useCreateGameMutation,
    useGetEventByIdQuery,
    useLazyFindGameByNameQuery,
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

const GameGuessPage = () => {
    const { eventId } = useParams();
    const { t } = useTranslation();
    const eventById = useGetEventByIdQuery({ eventId });
    const [findGameByName, findGameByNameResult] = useLazyFindGameByNameQuery();
    const [createGame, createGameResult] = useCreateGameMutation();
    const [suggestGame] = useSuggestGameMutation();
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const selectedRecord = eventById.data?.eventRecords.find(record => record.participant.id === userInfo.id);
    const [isSearchInSteam, setIsSearchInSteam] = useState(true);
    const [gameName, setGameName] = useState("");
    const [imgBlob, setImgBlob] = useState<Blob>();

    useEffect(() => {
        if(createGameResult.isSuccess) {
            suggestGame({ id: createGameResult.data.id });
        }
    }, [createGameResult.isSuccess]);

    useEffect(() => {
        if(findGameByNameResult.isSuccess && !findGameByNameResult.data.data.get("id")) {
            suggestGame({ id: createGameResult.data?.id || "" });
        }
    }, [findGameByNameResult.isSuccess]);

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
                            findGameByName({ name: gameName });
                        }} 
                        color="success">
                            Suggest game
                        </CommonButton>
                    </div>
                    {
                        findGameByNameResult.isSuccess && 
                        findGameByNameResult.data?.data.get("id") &&
                        <CommonModal 
                        name={"Game with such name already exist"} 
                        onClose={() => {

                        }}
                        onConfirm={() => {
                            const formData = new FormData();
                            formData.append("image", imgBlob || new Blob());
                            formData.append("eventRecordId", selectedRecord?.id || "");
                            formData.append("gameName", gameName);
                            createGame({ 
                                data: formData
                            });
                        }}>
                            Oi milord this game already exist in pool YOOOOLO
                        </CommonModal>
                    }
                </div>
            }
        </div>
    </div>
    );   
}

export { GameGuessPage }