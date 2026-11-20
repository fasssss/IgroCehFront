import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import iconClose from "root/assets/design/icon-close.svg";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { CatalogGameObject, useCreateGameFromVgcMutation } from "root/features/events/eventsApi";
import { CatalogGameSearch } from "root/features/events/components/CatalogGameSearch";
import { FavoriteGame, useGetFavoriteGamesQuery, useSetFavoriteGamesMutation } from "../../playersApi";
import { ProfileSection } from "../ProfileSection";
import './styles.scss';

// mirrors PlayerLimits.MaxFavoriteGames on backend
const MAX_FAVORITE_GAMES = 4;

// "Любимые игры" at the bottom of the tab "Мои игры" (layout 20691:1850): the cards of the games in the order the player added them;
// the owner finds a game in the catalog to add it and removes one by the cross, every change is saved at once
const FavoriteGames = ({ userId }: FavoriteGamesProps) => {
    const { t } = useTranslation();
    const isOwn = useCurrentUser()?.id === userId;
    const [isEditing, setIsEditing] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const favorites = useGetFavoriteGamesQuery(userId, { refetchOnMountOrArgChange: true });
    const [setFavoriteGames, saving] = useSetFavoriteGamesMutation();
    const [createGameFromVgc, creating] = useCreateGameFromVgcMutation();
    const games = favorites.data?.games ?? [];
    const isFull = games.length >= MAX_FAVORITE_GAMES;
    // the list may change while a picked game is saved to the database, the new game goes to the list of that moment
    const gamesRef = useRef(games);

    useLayoutEffect(() => {
        gamesRef.current = games;
    });

    // a player who has picked nothing gets no empty block
    if(!favorites.data || (!isOwn && !games.length)) {
        return null;
    }

    const add = async (catalogGame: CatalogGameObject) => {
        setAddError(null);
        try {
            const { gameId } = await createGameFromVgc({ vgcId: catalogGame.vgcId }).unwrap();
            const current = gamesRef.current;
            if(current.some(favorite => favorite.game.id === gameId)) {
                setAddError(t('favorites.alreadyAdded'));
                return;
            }

            if(current.length < MAX_FAVORITE_GAMES) {
                const added: FavoriteGame = {
                    game: { id: gameId, name: catalogGame.name, imageUrl: catalogGame.coverUrl },
                    releaseDate: catalogGame.releaseDate
                };
                setFavoriteGames({ userId, games: [...current, added] });
            }
        } catch {
            setAddError(t('favorites.addFailed'));
        }
    };

    const remove = (gameId: string) => {
        setAddError(null);
        setFavoriteGames({ userId, games: games.filter(favorite => favorite.game.id !== gameId) });
    };

    const renderCard = ({ game, releaseDate }: FavoriteGame) => {
        const imageUrl = resolveImageUrl(game.imageUrl);
        return(
            <li key={game.id} className="favorite-games__card">
                {
                    imageUrl ?
                    <img src={imageUrl} className="favorite-games__cover" alt="" />
                    :
                    <span className="favorite-games__cover favorite-games__cover--empty"><ImageNotSupportedOutlined /></span>
                }
                <div className="favorite-games__info">
                    <span className="favorite-games__name" title={game.name}>{game.name}</span>
                    {releaseDate && <span className="favorite-games__year">{releaseDate.slice(0, 4)}</span>}
                </div>
                {
                    isEditing &&
                    <button type="button" className="favorite-games__remove" aria-label={t('favorites.remove', { name: game.name })}
                        onClick={() => remove(game.id)}
                    >
                        <img src={iconClose} alt="" width={16} height={16} />
                    </button>
                }
            </li>
        );
    };

    return(
        <ProfileSection
            title={t('favorites.title')}
            isEditing={isEditing}
            onEditToggle={isOwn ? () => { setIsEditing(!isEditing); setAddError(null); } : undefined}
            className="favorite-games"
        >
            {
                isEditing &&
                <div className="favorite-games__editor">
                    {
                        isFull ?
                        <div className="favorite-games__hint">{t('favorites.full')}</div>
                        :
                        <div className="favorite-games__search">
                            <CatalogGameSearch onSelect={add} unavailableText={t('favorites.searchUnavailable')} />
                        </div>
                    }
                    {creating.isLoading && <div className="favorite-games__hint" role="status">{t('favorites.adding')}</div>}
                    {addError && <div className="favorite-games__error" role="alert">{addError}</div>}
                    {saving.isError && <div className="favorite-games__error" role="alert">{t("Couldn't save, try again")}</div>}
                </div>
            }
            {
                games.length || isEditing ?
                <ul className="favorite-games__grid">
                    {games.map(renderCard)}
                    {
                        // the free places show how many games can be added yet
                        isEditing && Array.from({ length: MAX_FAVORITE_GAMES - games.length }, (_, index) =>
                            <li key={`free-${index}`} className="favorite-games__card favorite-games__card--free" aria-hidden="true">
                                <span className="favorite-games__cover" />
                                <span className="favorite-games__info" />
                            </li>
                        )
                    }
                </ul>
                :
                <div className="profile-section__empty">{t('favorites.empty', { count: MAX_FAVORITE_GAMES })}</div>
            }
        </ProfileSection>
    );
};

type FavoriteGamesProps = {
    userId: string
}

export { FavoriteGames }
