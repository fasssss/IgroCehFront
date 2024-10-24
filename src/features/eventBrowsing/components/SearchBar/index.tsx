import SearchIcon from '@mui/icons-material/Search';
import './styles.scss';
import { useEffect, useState } from 'react';

const SearchBar = () => {
    const [searchText, setSearchText] = useState("");
    useEffect(() => {
        console.log(searchText);
    }, [searchText]);

    return(
        <div className="search-bar">
            <div className="search-bar__field">
                <input value={searchText} placeholder="Search guild..." onChange={(e) => setSearchText(e.target.value)} className='search-bar__input' type="text" />
                <SearchIcon className='search-bar__icon'/>
            </div>
        </div>
    );
}

export { SearchBar }