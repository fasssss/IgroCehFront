import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchBar } from "root/shared/components/SearchBar";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { DragNDropImage } from "root/shared/components/DragNDropImage";
import { CommonModal } from "root/shared/components/CommonModal";
import { igroCehApiBaseUrl } from "root/shared/constants";
import {
    GameObject,
    useCreateGameMutation,
    useLazyFindGameByNameQuery,
    useSuggestGameMutation
} from "../../eventsApi";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

// after the game is suggested EventStageRouter switches to the progress page by itself
const GameGuessPage = ({ event, currentUser }: EventStageProps) => {
    const { t } = useTranslation();
    const [findGameByName] = useLazyFindGameByNameQuery();
    const [createGame] = useCreateGameMutation();
    const [suggestGame] = useSuggestGameMutation();
    const [isSearchInSteam, setIsSearchInSteam] = useState(true);
    const [gameName, setGameName] = useState("");
    const [existingGame, setExistingGame] = useState<GameObject | null>(null);
    const [imgBlob, setImgBlob] = useState<Blob>();
    const ownRecord = event.eventRecords.find(record => record.participant.id === currentUser.id);

    if(!ownRecord) {
        return null;
    }

    const suggest = (gameId: string) =>
        suggestGame({ gameId, eventRecordId: ownRecord.id, eventId: event.id }).unwrap();

    const createAndSuggest = async () => {
        const formData = new FormData();
        formData.append("image", imgBlob || new Blob());
        formData.append("eventRecordId", ownRecord.id);
        formData.append("gameName", gameName);
        const { gameId } = await createGame({ data: formData }).unwrap();
        await suggest(gameId);
    };

    const handleSuggestClick = async () => {
        const { gameObject } = await findGameByName({ name: gameName }).unwrap();
        if(gameObject) {
            setExistingGame(gameObject);
        } else {
            await createAndSuggest();
        }
    };

    return(
    <div className="game-guess">
        <div className="game-guess__header">
            <div className="game-guess__user-plate">
                <img src={ownRecord.toUser?.avatarUrl ?? undefined} className="game-guess__user-image" />
                {ownRecord.toUser?.userName}
            </div>
        </div>
        <div className="game-guess__body">
            <div className="game-guess__body-buttons">
                <CommonButton
                disabled={isSearchInSteam}
                onClick={() => setIsSearchInSteam(true)}>
                    {t("Search in Steam")}
                </CommonButton>
                <CommonButton
                disabled={!isSearchInSteam}
                onClick={() => setIsSearchInSteam(false)}>
                    {t("Create custom")}
                </CommonButton>
            </div>
            {
                isSearchInSteam ?
                <SearchBar
                placeholder= {t("Search in Steam")}
                isFetchingResult={true}
                handleOptionClick={() => {}}
                optionsSelect={undefined} />
                :
                <div className="game-guess__custom-game">
                    <DragNDropImage value={imgBlob} stateMutator={setImgBlob} />
                    <br />
                    <CommonField
                    placeholder={t("Enter game name...")}
                    value={gameName}
                    className="game-guess__name-field"
                    onChange={(e) => { setGameName(e.target.value) }} />
                    <div className="game-guess__custom-game-submit">
                        <CommonButton
                        onClick={handleSuggestClick}
                        color="success">
                            {t("Suggest game")}
                        </CommonButton>
                    </div>
                    {
                        existingGame &&
                        <CommonModal
                        name={t("Game with such name already exists")}
                        onClose={() => {
                            setExistingGame(null);
                            createAndSuggest();
                        }}
                        onCloseText={t("Create new one")}
                        onConfirmText={t("Continue with existing")}
                        onConfirm={() => {
                            setExistingGame(null);
                            suggest(existingGame.id);
                        }}>
                            <div className="create-additional-modal">
                                <h3>👉{existingGame.name}👈</h3>
                                {
                                    existingGame.imageUrl &&
                                    <img src={igroCehApiBaseUrl + existingGame.imageUrl} />
                                }
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
