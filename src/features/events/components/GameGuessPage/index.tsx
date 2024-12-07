import { useParams } from "react-router-dom";
import { 
    useGetEventByIdQuery, 
    useSuggestGameMutation
} from "../../eventsApi";
import { useSelector } from "react-redux";
import { RootState } from "root/shared/store";
import './styles.scss';
import { SearchBar } from "root/shared/components/SearchBar";
import { useTranslation } from "react-i18next";
import { CommonButton } from "root/shared/components/CommonButton";
import { useState } from "react";
import { CommonField } from "root/shared/components/CommonField";
import { DragNDropImage } from "root/shared/components/DragNDropImage";

const GameGuessPage = () => {
    const { eventId } = useParams();
    const { t } = useTranslation();
    const eventById = useGetEventByIdQuery({ eventId });
    const [suggestGame, suggestGameResult] = useSuggestGameMutation();
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const selectedRecord = eventById.data?.eventRecords.find(record => record.participant.id === userInfo.id);
    const [isSearchInSteam, setIsSearchInSteam] = useState(true);
    const [gameName, setGameName] = useState("");
    const [imgBlob, setImgBlob] = useState<Blob>();

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
                            const formData = new FormData();
                            formData.append("image", imgBlob || new Blob());
                            formData.append("eventRecordId", selectedRecord?.id || "");
                            formData.append("gameName", gameName);
                            console.log("123");
                            suggestGame({ 
                                data: formData
                                // steamUrl: null
                            });
                        }} 
                        color="success">
                            Suggest game
                        </CommonButton>
                    </div>
                </div>
            }
        </div>
    </div>
    );   
}

export { GameGuessPage }