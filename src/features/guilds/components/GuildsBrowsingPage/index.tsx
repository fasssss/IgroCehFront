import { useTranslation } from "react-i18next";
import { SearchBar } from "root/shared/components/SearchBar";
import { useLazyGetSearchedGuildsQuery } from "../../guildsApi";
import { useNavigate } from "react-router-dom";

const GuildsBrowsingPage = () => {
    const [searchBar, searchResult] = useLazyGetSearchedGuildsQuery();
    const { t } = useTranslation();
    const navigate = useNavigate();

    return(
        <div className="guild-browser">
            <SearchBar 
            placeholder={t('Search guild...')}
            isFetchingResult={searchResult.isFetching}
            onTyping={searchBar}
            optionsSelect={
                searchResult.data?.guildObjects?.map(items => {
                    return({
                        id: items.id,
                        label: items.name,
                        iconUrl: items.iconUrl
                    })
                })
            }
            handleOptionClick={guildId => navigate(`guild/${guildId}`)} />
        </div>
    );
}

export { GuildsBrowsingPage }