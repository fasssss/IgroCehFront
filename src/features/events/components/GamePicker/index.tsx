import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { DragNDropImage } from "root/shared/components/DragNDropImage";
import { CommonModal } from "root/shared/components/CommonModal";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { isConflictError } from "root/shared/igroCehApi";
import {
    CatalogGameObject,
    GameObject,
    useCreateGameFromVgcMutation,
    useCreateGameMutation,
    useLazyFindGameByNameQuery
} from "../../eventsApi";
import { CatalogGameSearch } from "../CatalogGameSearch";
import { CatalogGameCard } from "../CatalogGameCard";
import './styles.scss';

// a game from VideoGamesCritic or a custom one; the page decides where the picked game goes
const GamePicker = ({ onPick, isPicking = false, conflictText }: GamePickerProps) => {
    const { t } = useTranslation();
    const [findGameByName] = useLazyFindGameByNameQuery();
    const [createGame] = useCreateGameMutation();
    const [createGameFromVgc, createGameFromVgcResult] = useCreateGameFromVgcMutation();
    const [selectedGame, setSelectedGame] = useState<CatalogGameObject | null>(null);
    const [selectError, setSelectError] = useState<string | null>(null);
    const [customGameError, setCustomGameError] = useState<string | null>(null);
    const [isSearchInVideoGamesCritic, setIsSearchInVideoGamesCritic] = useState(true);
    const [gameName, setGameName] = useState("");
    const [existingGame, setExistingGame] = useState<GameObject | null>(null);
    const [imgBlob, setImgBlob] = useState<Blob>();

    const createAndPick = async () => {
        const formData = new FormData();
        formData.append("image", imgBlob || new Blob());
        formData.append("gameName", gameName);
        const { gameId } = await createGame({ data: formData }).unwrap();
        await onPick(gameId);
    };

    const isSelecting = createGameFromVgcResult.isLoading || isPicking;

    // the place the game goes refuses a game with 409, e.g. a player never gets the same game twice
    const toErrorText = (error: unknown) => isConflictError(error)
        ? conflictText
        : t("Failed to select the game, try again");

    const selectCatalogGame = async (game: CatalogGameObject) => {
        setSelectError(null);
        try {
            const { gameId } = await createGameFromVgc({ vgcId: game.vgcId }).unwrap();
            await onPick(gameId);
        } catch (error) {
            setSelectError(toErrorText(error));
        }
    };

    const runCustomGameAction = async (action: () => Promise<void>) => {
        setCustomGameError(null);
        try {
            await action();
        } catch (error) {
            setCustomGameError(toErrorText(error));
        }
    };

    const handleSuggestClick = async () => {
        const { gameObject } = await findGameByName({ name: gameName }).unwrap();
        if(gameObject) {
            setExistingGame(gameObject);
        } else {
            await createAndPick();
        }
    };

    return(
        <div className="game-picker">
            <div className="game-picker__modes">
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
                <div className="game-picker__catalog">
                    <CatalogGameSearch
                    onSelect={setSelectedGame}
                    unavailableText={t("Search is unavailable, try later or create a custom game")} />
                    {
                        selectedGame &&
                        <CatalogGameCard
                        game={selectedGame}
                        action={
                            <CommonButton
                            color="success"
                            disabled={isSelecting}
                            onClick={() => selectCatalogGame(selectedGame)}>
                                {t("Select game")}
                            </CommonButton>
                        }
                        footer={selectError && <div className="game-picker__select-error">{selectError}</div>} />
                    }
                </div>
                :
                <div className="game-picker__custom-game">
                    <DragNDropImage value={imgBlob} stateMutator={setImgBlob} />
                    <br />
                    <CommonField
                    placeholder={t("Enter game name...")}
                    value={gameName}
                    className="game-picker__name-field"
                    onChange={(e) => { setGameName(e.target.value) }} />
                    <div className="game-picker__custom-game-submit">
                        <CommonButton
                        onClick={() => runCustomGameAction(handleSuggestClick)}
                        color="success">
                            {t("Suggest game")}
                        </CommonButton>
                    </div>
                    {
                        customGameError &&
                        <div className="game-picker__custom-game-error">{customGameError}</div>
                    }
                    {
                        existingGame &&
                        <CommonModal
                        name={t("Game with such name already exists")}
                        onClose={() => {
                            setExistingGame(null);
                            runCustomGameAction(createAndPick);
                        }}
                        onCloseText={t("Create new one")}
                        onConfirmText={t("Continue with existing")}
                        onConfirm={() => {
                            setExistingGame(null);
                            runCustomGameAction(() => onPick(existingGame.id));
                        }}>
                            <div className="game-picker__existing-game">
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
    );
};

type GamePickerProps = {
    // puts the game where it belongs, a thrown error is shown under the picker
    onPick: (gameId: string) => Promise<void>,
    // the game is being put, so it isn't picked twice
    isPicking?: boolean,
    // what 409 of the place the game goes means
    conflictText: string
}

export { GamePicker }
