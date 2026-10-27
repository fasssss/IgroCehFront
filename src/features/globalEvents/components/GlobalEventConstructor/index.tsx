import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { CommonModal } from "root/shared/components/CommonModal";
import { DragNDropImage } from "root/shared/components/DragNDropImage";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { isConflictError } from "root/shared/igroCehApi";
import type { CatalogGameObject } from "root/features/events/eventsApi";
import { CatalogGameSearch } from "root/features/events/components/CatalogGameSearch";
import { CatalogGameCard } from "root/features/events/components/CatalogGameCard";
import {
    GlobalEvent,
    GlobalEventAchievement,
    useCreateGlobalEventMutation,
    useDeleteGlobalEventMutation,
    useFinishGlobalEventMutation,
    useSetGlobalEventImageMutation,
    useUpdateGlobalEventMutation
} from "../../globalEventsApi";
import {
    GLOBAL_EVENT_DESCRIPTION_MAX_LENGTH,
    GLOBAL_EVENT_IMAGE_MAX_SIZE,
    GLOBAL_EVENT_IMAGE_TYPES,
    GLOBAL_EVENT_MAX_GAMES,
    GLOBAL_EVENT_MIN_GAMES,
    GLOBAL_EVENT_NAME_MAX_LENGTH
} from "../../globalEventLimits";
import { globalEventEditPath } from "../../globalEventPath";
import { AchievementPicker } from "../AchievementPicker";
import { GlobalEventGameCard } from "../GlobalEventGameCard";
import type { GlobalEventConstructorPageState } from "../GlobalEventConstructorPage";
import './styles.scss';

// a game the administrator has put into the event with the achievements that mean it is passed,
// without them the passing is confirmed only by hand
type ChosenGame = {
    appId: number,
    name: string,
    // a catalog cover or an image uploaded to the API
    imageUrl: string | null,
    achievements: GlobalEventAchievement[]
}

const toChosenGames = (globalEvent?: GlobalEvent): ChosenGame[] => globalEvent?.games.map(eventGame => ({
    appId: eventGame.appId,
    name: eventGame.game.name,
    imageUrl: eventGame.game.imageUrl,
    achievements: eventGame.achievements
})) ?? [];

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// two steps like on the mockup: the banner with the name and the description, then the games with their achievements;
// the same page changes an existing event, then it can be saved from either step
const GlobalEventConstructor = ({ globalEvent, isImageFailed }: GlobalEventConstructorProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [createGlobalEvent, createResult] = useCreateGlobalEventMutation();
    const [updateGlobalEvent, updateResult] = useUpdateGlobalEventMutation();
    const [setGlobalEventImage, setImageResult] = useSetGlobalEventImageMutation();
    const [finishGlobalEvent, finishResult] = useFinishGlobalEventMutation();
    const [deleteGlobalEvent, deleteResult] = useDeleteGlobalEventMutation();
    const [step, setStep] = useState<1 | 2>(1);
    const [image, setImage] = useState<Blob>();
    const [name, setName] = useState(globalEvent?.name ?? "");
    const [description, setDescription] = useState(globalEvent?.description ?? "");
    const [games, setGames] = useState(() => toChosenGames(globalEvent));
    const [selectedGame, setSelectedGame] = useState<CatalogGameObject | null>(null);
    const [selectedAchievements, setSelectedAchievements] = useState<GlobalEventAchievement[]>([]);
    // a chosen game whose achievements are being changed, it replaces the game on "Done"
    const [editedGame, setEditedGame] = useState<ChosenGame | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [confirmedAction, setConfirmedAction] = useState<'finish' | 'delete' | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const isSaving = createResult.isLoading || updateResult.isLoading || setImageResult.isLoading;
    const imageProblem = !image ? null
        : !GLOBAL_EVENT_IMAGE_TYPES.includes(image.type) ? t("The image should be PNG, JPEG, WebP or GIF")
        : image.size > GLOBAL_EVENT_IMAGE_MAX_SIZE ? t("The image should be up to 10 MB")
        : null;
    const isBannerMissing = !(image || globalEvent?.imageUrl) || !name.trim();
    const isBannerReady = !isBannerMissing && !imageProblem;
    const canSave = isBannerReady && games.length >= GLOBAL_EVENT_MIN_GAMES && !editedGame && !isSaving;
    const isSelectedInEvent = !!selectedGame && games.some(game => game.appId === selectedGame.vgcId);
    // once a player has rolled, the games and their achievements stay as they are
    const isGamesLocked = !!globalEvent?.participantCount;

    const selectGame = (game: CatalogGameObject) => {
        setSelectedGame(game);
        setSelectedAchievements([]);
    };

    const addSelectedGame = () => {
        if(!selectedGame) {
            return;
        }

        setGames([...games, {
            appId: selectedGame.vgcId,
            name: selectedGame.name,
            imageUrl: selectedGame.coverUrl,
            achievements: selectedAchievements
        }]);
        setSelectedGame(null);
        setSelectedAchievements([]);
    };

    const applyEditedGame = () => {
        if(editedGame) {
            setGames(games.map(game => game.appId === editedGame.appId ? editedGame : game));
            setEditedGame(null);
        }
    };

    const toSaveErrorText = (error: unknown) =>
        isConflictError(error) && globalEvent ? t("Players have rolled the games already, the games and the achievements can't change")
        : isConflictError(error) ? t("Another global event is active, finish it first")
        : errorStatus(error) === 400 ? t("Steam or the catalog doesn't know a game or an achievement, check the games")
        : errorStatus(error) === 503 ? t("Steam or the catalog doesn't answer, try later")
        : t("Couldn't save the event, try again");

    // the image goes with its own request after the event is saved
    const save = async () => {
        setSaveError(null);
        const request = {
            name,
            description,
            games: games.map(game => ({ appId: game.appId, achievementApiNames: game.achievements.map(achievement => achievement.apiName) }))
        };
        let savedId: string;
        try {
            const { globalEvent: saved } = globalEvent
                ? await updateGlobalEvent({ globalEventId: globalEvent.id, ...request }).unwrap()
                : await createGlobalEvent(request).unwrap();
            savedId = saved!.id;
        } catch (error) {
            setSaveError(toSaveErrorText(error));
            return;
        }

        if(image) {
            const data = new FormData();
            data.append("globalEventId", savedId);
            data.append("image", image);
            try {
                await setGlobalEventImage({ data }).unwrap();
            } catch {
                // the event exists already, so the image is tried again from its own page
                const state: GlobalEventConstructorPageState = { isImageFailed: true };
                navigate(globalEventEditPath(savedId), { replace: true, state });
                return;
            }
        }

        navigate('/');
    };

    const runEventAction = async () => {
        if(!globalEvent || !confirmedAction) {
            return;
        }

        setActionError(null);
        try {
            if(confirmedAction === 'finish') {
                await finishGlobalEvent({ globalEventId: globalEvent.id }).unwrap();
            } else {
                await deleteGlobalEvent({ globalEventId: globalEvent.id }).unwrap();
            }
            navigate('/');
        } catch {
            setActionError(confirmedAction === 'finish' ? t("Couldn't finish the event, try again") : t("Couldn't delete the event, try again"));
            setConfirmedAction(null);
        }
    };

    const saveButton =
        <>
            {isSaving && <CircularProgress size={24} color="primary" />}
            <CommonButton color="success" disabled={!canSave} onClick={save}>
                {globalEvent ? t("Save") : t("Create the event")}
            </CommonButton>
        </>;
    const saveErrorText = saveError && <div className="global-event-constructor__error">{saveError}</div>;

    return(
        <div className="global-event-constructor">
            <div className="global-event-constructor__header">
                <h1 className="global-event-constructor__title">{globalEvent ? t("Editing the global event") : t("New global event")}</h1>
                <div className="global-event-constructor__step">
                    {step === 1 ? t("Step 1 of 2: the banner") : t("Step 2 of 2: the games")}
                </div>
                {
                    globalEvent &&
                    <div className="global-event-constructor__event-actions">
                        {
                            globalEvent.finishedAt ?
                            <span className="global-event-constructor__finished">{t("The event is finished")}</span>
                            :
                            <CommonButton color="warning" onClick={() => setConfirmedAction('finish')}>{t("Finish the event")}</CommonButton>
                        }
                        <CommonButton color="error" onClick={() => setConfirmedAction('delete')}>{t("Delete event")}</CommonButton>
                    </div>
                }
                {actionError && <div className="global-event-constructor__error">{actionError}</div>}
                {
                    isImageFailed &&
                    <div className="global-event-constructor__error">{t("The event is saved, but the image isn't: choose it again and save")}</div>
                }
            </div>
            {
                step === 1 ?
                <div className="global-event-constructor__banner-step">
                    <DragNDropImage
                    value={image}
                    stateMutator={setImage}
                    imageUrl={resolveImageUrl(globalEvent?.imageUrl)}
                    className="global-event-constructor__image" />
                    <div className={`global-event-constructor__image-hint ${imageProblem ? "global-event-constructor__error" : ""}`}>
                        {imageProblem ?? t("The banner of the main page, a wide image fits best")}
                    </div>
                    <CommonField
                    placeholder={t("Event name")}
                    value={name}
                    maxLength={GLOBAL_EVENT_NAME_MAX_LENGTH}
                    className="global-event-constructor__name"
                    onChange={e => setName(e.target.value)} />
                    <textarea
                    className="global-event-constructor__description"
                    placeholder={t("Description")}
                    value={description}
                    maxLength={GLOBAL_EVENT_DESCRIPTION_MAX_LENGTH}
                    onChange={e => setDescription(e.target.value)} />
                    <div className="global-event-constructor__actions">
                        {isBannerMissing && <div className="global-event-constructor__note">{t("Add an image and a name")}</div>}
                        <CommonButton disabled={!isBannerReady} onClick={() => setStep(2)}>{t("Next")}</CommonButton>
                        {/* a saved event can be changed without the games step */}
                        {globalEvent && saveButton}
                    </div>
                    {saveErrorText}
                </div>
                :
                <div className="global-event-constructor__games-step">
                    <div className="global-event-constructor__back">
                        <CommonButton onClick={() => setStep(1)}>{t("Back")}</CommonButton>
                    </div>
                    {
                        isGamesLocked ?
                        <div className="global-event-constructor__note">
                            {t("Players have rolled the games already, the games and the achievements can't change")}
                        </div>
                        : games.length < GLOBAL_EVENT_MAX_GAMES ?
                        <div className="global-event-constructor__search">
                            <CatalogGameSearch onSelect={selectGame} unavailableText={t("Search is unavailable, try later")} />
                            {
                                selectedGame &&
                                <CatalogGameCard
                                game={selectedGame}
                                footer={
                                    isSelectedInEvent ?
                                    <div className="global-event-constructor__note">{t("The game is in the event already")}</div>
                                    :
                                    <div className="global-event-constructor__picked">
                                        <AchievementPicker
                                        key={selectedGame.vgcId}
                                        appId={selectedGame.vgcId}
                                        chosen={selectedAchievements}
                                        onChange={setSelectedAchievements} />
                                        <CommonButton color="success" onClick={addSelectedGame}>
                                            {t("Add to the event")}
                                        </CommonButton>
                                    </div>
                                } />
                            }
                        </div>
                        :
                        <div className="global-event-constructor__note">{t("An event can have up to {{max}} games", { max: GLOBAL_EVENT_MAX_GAMES })}</div>
                    }
                    <h2 className="global-event-constructor__games-title">{t("Games of the event: {{count}}", { count: games.length })}</h2>
                    {
                        games.length ?
                        <div className="global-event-constructor__games">
                            {
                                games.map(game => {
                                    const isEdited = editedGame?.appId === game.appId;
                                    return(
                                        <GlobalEventGameCard
                                        key={game.appId}
                                        name={game.name}
                                        imageUrl={game.imageUrl}
                                        achievements={isEdited ? editedGame.achievements : game.achievements}
                                        actions={
                                            !isEdited && !isGamesLocked &&
                                            <>
                                                <CommonButton disabled={!!editedGame} onClick={() => setEditedGame(game)}>
                                                    {game.achievements.length ? t("Change achievements") : t("Choose achievements")}
                                                </CommonButton>
                                                <CommonButton
                                                color="error"
                                                disabled={!!editedGame}
                                                onClick={() => setGames(games.filter(item => item.appId !== game.appId))}>
                                                    {t("Remove")}
                                                </CommonButton>
                                            </>
                                        }>
                                            {
                                                isEdited &&
                                                <div className="global-event-constructor__picked">
                                                    <AchievementPicker
                                                    appId={game.appId}
                                                    chosen={editedGame.achievements}
                                                    onChange={achievements => setEditedGame({ ...editedGame, achievements })} />
                                                    <div className="global-event-constructor__edited-actions">
                                                        <CommonButton onClick={() => setEditedGame(null)}>{t("Cancel")}</CommonButton>
                                                        <CommonButton color="success" onClick={applyEditedGame}>
                                                            {t("Done")}
                                                        </CommonButton>
                                                    </div>
                                                </div>
                                            }
                                        </GlobalEventGameCard>
                                    );
                                })
                            }
                        </div>
                        :
                        <div className="global-event-constructor__note">{t("No games yet, find them in VideoGamesCritic")}</div>
                    }
                    <div className="global-event-constructor__actions">
                        {
                            games.length < GLOBAL_EVENT_MIN_GAMES &&
                            <div className="global-event-constructor__note">
                                {t("Add at least {{min}} games, a player rolls {{min}} at once", { min: GLOBAL_EVENT_MIN_GAMES })}
                            </div>
                        }
                        {saveButton}
                    </div>
                    {saveErrorText}
                </div>
            }
            {
                confirmedAction &&
                <CommonModal
                name={confirmedAction === 'finish' ? t("Finish the global event?") : t("Delete the global event?")}
                onConfirmText={t("Yes")}
                onCloseText={t("No")}
                onConfirm={runEventAction}
                onClose={() => setConfirmedAction(null)}>
                    <div className="global-event-constructor__modal-text">
                        {
                            confirmedAction === 'finish' ?
                            t("Players can't take part in it any more. After that a new event can be created.")
                            :
                            t("The event disappears for everyone.")
                        }
                    </div>
                    {
                        (finishResult.isLoading || deleteResult.isLoading) &&
                        <CircularProgress color="primary" />
                    }
                </CommonModal>
            }
        </div>
    );
};

type GlobalEventConstructorProps = {
    // the event being changed, a new one is made without it
    globalEvent?: GlobalEvent,
    // the event was saved, but its image wasn't
    isImageFailed: boolean
}

export { GlobalEventConstructor }
