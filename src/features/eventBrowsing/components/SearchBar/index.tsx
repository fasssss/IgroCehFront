import SearchIcon from '@mui/icons-material/Search';
import './styles.scss';

const SearchBar = () => {
    return(
        <div className="search-bar">
            <div className="search-bar__field">
                <input className='search-bar__input' type="text" />
                <SearchIcon className='search-bar__icon'/>
            </div>
        </div>
    );
}

export { SearchBar }