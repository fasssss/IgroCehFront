import SearchIcon from '@mui/icons-material/Search';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import { ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PillItem, Pills } from '../Pills';
import './styles.scss';

const SEARCH_DELAY_MS = 400;

const SearchBar = ({
    placeholder,
    onTyping,
    optionsSelect,
    isFetchingResult = false,
    handleOptionClick,
    minSearchLength = 1,
    errorText,
    imageShape = 'square'
}: SearchBarProps) => {
    const { t } = useTranslation();
    const [searchBarText, setSearchBarText] = useState('');
    const [isSearchFocused, setSearchFocused] = useState(false);
    const onTypingRef = useRef(onTyping);
    const searchString = searchBarText.trim();
    const isSearchable = searchString.length >= minSearchLength;

    useLayoutEffect(() => {
        onTypingRef.current = onTyping;
    });

    // search starts when user stops typing, not on every key
    useEffect(() => {
        if(!isSearchable) return;

        const timeout = setTimeout(() => onTypingRef.current?.({ searchString }), SEARCH_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [searchString, isSearchable]);

    const searchBarHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchBarText(e.target.value);
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
                isSearchable && isSearchFocused &&
                <div className='search-bar__dropdown'>
                    {
                        isFetchingResult ?
                        <div className='search-bar__option-loader'>
                            <CircularProgress color="primary" />
                        </div>
                        : errorText ?
                        <div className='search-bar__option-message'>{errorText}</div>
                        : optionsSelect?.length === 0 ?
                        <div className='search-bar__option-message'>{t('Nothing found')}</div>
                        :
                        optionsSelect?.map((value) => {
                            return (
                                <div key={value.id} onClick={() => handleOptionClick(value.id)} className='search-bar__option'>
                                    {
                                        value.iconUrl ?
                                        <img className={`search-bar__option-image search-bar__option-image--${imageShape}`} src={value.iconUrl} />
                                        :
                                        <div title={t('No Image')} className={`search-bar__option-image-placeholder search-bar__option-image--${imageShape}`}>
                                            <ImageNotSupportedOutlinedIcon />
                                        </div>
                                    }
                                    <span className='search-bar__option-label'>{value.label}</span>
                                    {
                                        value.tags && value.tags.length > 0 &&
                                        <Pills items={value.tags} className='search-bar__option-tags' />
                                    }
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
        iconUrl: string | null,
        // shown as pills on the right side of the option
        tags?: PillItem[]
    }> | undefined,
    // shorter text doesn't trigger search and doesn't open the dropdown
    minSearchLength?: number,
    // shown in the dropdown instead of results
    errorText?: string,
    // portrait fits game covers, square fits icons
    imageShape?: 'square' | 'portrait'
}

export { SearchBar }