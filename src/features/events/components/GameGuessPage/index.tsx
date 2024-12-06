import { useParams } from "react-router-dom";
import { useGetEventByIdQuery } from "../../eventsApi";
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
    const userInfo = useSelector((state: RootState) => state.authorizationReducer);
    const selectedRecord = eventById.data?.eventRecords.find(record => record.participant.id === userInfo.id);
    const [isSearchInSteam, setIsSearchInSteam] = useState(true);
    const [gameName, setGameName] = useState("");

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
                    <DragNDropImage />
                    <br />
                    <CommonField 
                    placeholder="Enter game name..."
                    value={gameName}
                    className="game-guess__name-field"
                    onChange={(e) => { setGameName(e.target.value) }} />
                    <div className="game-guess__custom-game-submit">
                        <CommonButton color="success">Guess game</CommonButton>
                    </div>
                </div>
            }
        </div>
    </div>
    );   
}

export { GameGuessPage }