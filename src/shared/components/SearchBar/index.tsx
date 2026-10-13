import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import './styles.scss';

const SearchBar = ({placeholder, onTyping, optionsSelect, isFetchingResult = false, handleOptionClick}: SearchBarProps) => {
    const { t } = useTranslation();
    const [searchBarText, setSearchBarText] = useState('');
    const [isSearchFocused, setSearchFocused] = useState(false);
    const searchBarHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchBarText(e.target.value);
        if(e.target.value){
            onTyping?.({ searchString: e.target.value })
        }
    }

    useEffect(() => {
        const handleClick = () => {
            setSearchFocused(document.getElementsByClassName('search-bar__input')[0] == document.activeElement);
        }

        document.addEventListener("click", handleClick)
        return () => {
            document.removeEventListener("click", handleClick)
        }
    }, []);

    return(
        <div className="search-bar">
            <div className="search-bar__field">
                <input list='guilds' value={searchBarText} placeholder={placeholder} onChange={searchBarHandler} className='search-bar__input' type="text" />
                <SearchIcon className='search-bar__icon'/>
            </div>
            {
                searchBarText && isSearchFocused && 
                <div className='search-bar__dropdown'>
                    {
                        isFetchingResult ?
                        <div className='search-bar__option-loader'>
                            <CircularProgress color="primary" />
                        </div>
                        :
                        optionsSelect?.map((value) => {
                            return (
                                <div key={value.id} onClick={() => handleOptionClick(value.id)} className='search-bar__option'>
                                    {
                                        value.iconUrl ?
                                        <img className='search-bar__option-image' src={value.iconUrl} />
                                        :
                                        <div className='search-bar__option-image-placeholder'>{t('No Image')}</div>
                                    }
                                    {value.label}
                                </div>
                            );
                        })
                    }
                </div>
            }
        </div>
    );
}

export type SearchBarProps = {
    placeholder?: string,
    onTyping?: (filter: { searchString: string }) => void,
    isFetchingResult: boolean,
    handleOptionClick: (id: string) => void,
    optionsSelect: Array<{
        id: string
        label: string | null,
        iconUrl: string | null
    }> | undefined
}

export { SearchBar }