import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent, useState } from 'react';
import { useLazyGetSearchedGuildsQuery } from '../../guildsBrowsingApi';
import './styles.scss';
import { CircularProgress } from '@mui/material';
import { useOnMount } from 'root/shared/hooks/useOnMount';

const SearchBar = () => {
    const [searchBar, searchResult] = useLazyGetSearchedGuildsQuery();
    const [searchBarText, setSearchBarText] = useState('');
    const [isSearchFocused, setSearchFocused] = useState(false);
    const searchBarHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchBarText(e.target.value);
        if(e.target.value){
            searchBar({ searchString: e.target.value })
        }
    }

    useOnMount(() => {
        const handleClick = () => {
            setSearchFocused(document.getElementsByClassName('search-bar__input')[0] == document.activeElement);
        }

        document.addEventListener("click", handleClick)
        return () => {
            document.removeEventListener("click", handleClick)
        }
    });

    return(
        <div className="search-bar">
            <div className="search-bar__field">
                <input list='guilds' value={searchBarText} placeholder="Search guild..." onChange={searchBarHandler} className='search-bar__input' type="text" />
                <SearchIcon className='search-bar__icon'/>
            </div>
            {
                searchBarText && isSearchFocused && 
                <div className='search-bar__dropdown'>
                    {
                        searchResult.isFetching ?
                        <div className='search-bar__option-loader'>
                            <CircularProgress color="primary" />
                        </div>
                        :
                        searchResult.data?.guildObjects?.map((value) => {
                            return (
                                <div key={value.id} className='search-bar__option'>
                                    {
                                        value.iconUrl ?
                                        <img className='search-bar__option-image' src={value.iconUrl} />
                                        :
                                        <div className='search-bar__option-image-placeholder'>No Image</div>
                                    }
                                    {value.name}
                                </div>
                            );
                        })
                    }
                </div>
            }
        </div>
    );
}

export { SearchBar }