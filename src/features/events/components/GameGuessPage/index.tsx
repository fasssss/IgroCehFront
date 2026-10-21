import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchBar } from "root/shared/components/SearchBar";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { DragNDropImage } from "root/shared/components/DragNDropImage";
import { CommonModal } from "root/shared/components/CommonModal";
import { Pills } from "root/shared/components/Pills";
import { PoweredBy } from "root/shared/components/PoweredBy";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import {
    CatalogGameObject,
    GameObject,
    useCreateGameFromVgcMutation,
    useCreateGameMutation,
    useLazyFindGameByNameQuery,
    useLazySearchGamesQuery,
    useSuggestGameMutation
} from "../../eventsApi";
import { toPlatformPills } from "../../platformPills";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

const MIN_CATALOG_SEARCH_LENGTH = 2; // VideoGamesCritic doesn't search by a single character

const getScoreLevel = (score: number | null) =>
    score === null ? 'none' : score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

// after the game is suggested EventStageRouter switches to the progress page by itself
const GameGuessPage = ({ event, currentUser }: EventStageProps) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const navigate = useNavigate();
    const [findGameByName] = useLazyFindGameByNameQuery();
    const [createGame] = useCreateGameMutation();
    const [suggestGame, suggestGameResult] = useSuggestGameMutation();
    const [searchGames, searchGamesResult] = useLazySearchGamesQuery();
    const [createGameFromVgc, createGameFromVgcResult] = useCreateGameFromVgcMutation();
    const [selectedGame, setSelectedGame] = useState<CatalogGameObject | null>(null);
    const [isSelectFailed, setIsSelectFailed] = useState(false);
    const [isSearchInVideoGamesCritic, setIsSearchInVideoGamesCritic] = useState(true);
    const [gameName, setGameName] = useState("");
    const [existingGame, setExistingGame] = useState<GameObject | null>(null);
    const [imgBlob, setImgBlob] = useState<Blob>();
    const ownRecord = event.eventRecords.find(record => record.participant.id === currentUser.id);

    if(!ownRecord) {
        return null;
    }

    const eventPath = `/guild/${guildId}/event/${event.id}`;
    // a changed game is picked on its own page, so the event page is opened back after it
    const suggest = async (gameId: string) => {
        await suggestGame({ gameId, eventRecordId: ownRecord.id, eventId: event.id }).unwrap();
        navigate(eventPath, { replace: true });
    };

    const createAndSuggest = async () => {
        const formData = new FormData();
        formData.append("image", imgBlob || new Blob());
        formData.append("eventRecordId", ownRecord.id);
        formData.append("gameName", gameName);
        const { gameId } = await createGame({ data: formData }).unwrap();
        await suggest(gameId);
    };

    const foundGames = searchGamesResult.data?.games;
    const isSelecting = createGameFromVgcResult.isLoading || suggestGameResult.isLoading;

    const selectCatalogGame = async (game: CatalogGameObject) => {
        setIsSelectFailed(false);
        try {
            const { gameId } = await createGameFromVgc({ vgcId: game.vgcId }).unwrap();
            await suggest(gameId);
        } catch {
            setIsSelectFailed(true);
        }
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
            {
                // a guessed game here means the participant came back to change it before the event is activated
                ownRecord.game &&
                <div className="game-guess__change">
                    <div className="game-guess__change-text">
                        {t("Now guessed: {{game}}", { game: ownRecord.game.name })}
                    </div>
                    <CommonButton onClick={() => navigate(eventPath)}>
                        {t("Back to the event")}
                    </CommonButton>
                </div>
            }
        </div>
        <div className="game-guess__body">
            <div className="game-guess__body-buttons">
                <CommonButton
                disabled={isSearchInVideoGamesCritic}
                onClick={() => setIsSearchInVideoGamesCritic(true)}>
                    {t("Search in VideoGamesCritic")}
                </CommonButton>
                <CommonButton
                disabled={!isSearchInVideoGamesCritic}
                onClick={() => setIsSearchInVideoGamesCritic(false)}>
                    {t("Create custom")}
                </CommonButton>
            </div>
            {
                isSearchInVideoGamesCritic ?
                <div className="game-guess__catalog">
                    <SearchBar
                    placeholder= {t("Search in VideoGamesCritic")}
                    minSearchLength={MIN_CATALOG_SEARCH_LENGTH}
                    imageShape="portrait"
                    onTyping={({ searchString }) => searchGames({ query: searchString }, true)}
                    isFetchingResult={searchGamesResult.isFetching}
                    errorText={searchGamesResult.isError ? t("Search is unavailable, try later or create a custom game") : undefined}
                    optionsSelect={foundGames?.map(game => ({
                        id: String(game.vgcId),
                        label: game.releaseDate ? `${game.name} (${game.releaseDate.slice(0, 4)})` : game.name,
                        iconUrl: game.coverUrl,
                        tags: toPlatformPills(game.platforms)
                    }))}
                    handleOptionClick={id => setSelectedGame(foundGames?.find(game => String(game.vgcId) === id) ?? null)} />
                    {
                        selectedGame &&
                        <div className="game-guess__selected-game">
                            <img src={selectedGame.coverUrl ?? undefined} className="game-guess__selected-game-image" />
                            <div className="game-guess__selected-game-info">
                                <div className="game-guess__selected-game-name-container">
                                    <div className="game-guess__selected-game-name">{selectedGame.name}</div>
                                </div>
                                <Pills items={toPlatformPills(selectedGame.platforms)} />
                                <div className="game-guess__selected-game-scores">
                                    <div className="game-guess__selected-game-score-label">{t("Critics score")}:</div>
                                    <div className={`game-guess__score game-guess__score--${getScoreLevel(selectedGame.criticsScore)}`}>
                                        {selectedGame.criticsScore ?? "—"}
                                    </div>
                                    <div className="game-guess__selected-game-score-label">{t("Players score")}:</div>
                                    <div className={`game-guess__score game-guess__score--${getScoreLevel(selectedGame.playersScore)}`}>
                                        {selectedGame.playersScore ?? "—"}
                                    </div>
                                </div>
                            </div>
                            <PoweredBy href={selectedGame.pageUrl} className="game-guess__selected-game-powered-by" />
                            <div className="game-guess__selected-game-select">
                                <CommonButton
                                color="success"
                                disabled={isSelecting}
                                onClick={() => selectCatalogGame(selectedGame)}>
                                    {t("Select game")}
                                </CommonButton>
                            </div>
                            {
                                isSelectFailed &&
                                <div className="game-guess__selected-game-error">{t("Failed to select the game, try again")}</div>
                            }
                        </div>
                    }
                </div>
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
                                    <img src={resolveImageUrl(existingGame.imageUrl)} />
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
