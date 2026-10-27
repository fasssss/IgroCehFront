import { useTranslation } from "react-i18next";
import { SearchBar } from "root/shared/components/SearchBar";
import { CatalogGameObject, useLazySearchGamesQuery } from "../../eventsApi";
import { toPlatformPills } from "../../platformPills";

const MIN_CATALOG_SEARCH_LENGTH = 2; // VideoGamesCritic doesn't search by a single character

// the search in VideoGamesCritic, the page decides what the chosen game is for
const CatalogGameSearch = ({ onSelect, unavailableText }: CatalogGameSearchProps) => {
    const { t } = useTranslation();
    const [searchGames, searchGamesResult] = useLazySearchGamesQuery();
    const foundGames = searchGamesResult.data?.games;

    return(
        <SearchBar
        placeholder={t("Search in VideoGamesCritic")}
        minSearchLength={MIN_CATALOG_SEARCH_LENGTH}
        imageShape="portrait"
        onTyping={({ searchString }) => searchGames({ query: searchString }, true)}
        isFetchingResult={searchGamesResult.isFetching}
        errorText={searchGamesResult.isError ? unavailableText : undefined}
        optionsSelect={foundGames?.map(game => ({
            id: String(game.vgcId),
            label: game.releaseDate ? `${game.name} (${game.releaseDate.slice(0, 4)})` : game.name,
            iconUrl: game.coverUrl,
            tags: toPlatformPills(game.platforms)
        }))}
        handleOptionClick={id => {
            const game = foundGames?.find(game => String(game.vgcId) === id);
            if(game) {
                onSelect(game);
            }
        }} />
    );
};

type CatalogGameSearchProps = {
    onSelect: (game: CatalogGameObject) => void,
    // shown in the dropdown when the catalog doesn't answer
    unavailableText: string
}

export { CatalogGameSearch }
