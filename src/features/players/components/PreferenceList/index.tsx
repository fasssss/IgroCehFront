import { useTranslation } from "react-i18next";
import { Autocomplete, Chip, ChipProps, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import { PlayerPreferences, PreferenceTag } from "../../playersApi";
import { usePreferenceTagName } from "../../preferenceTagName";
import './styles.scss';

// mirrors PreferenceLimits.MaxTagsPerList on backend
const MAX_TAGS_PER_LIST = 20;

export type PreferenceListKind = keyof PlayerPreferences;

// one list of tags under its title: a field where tags are added by typing, or just the tags when it is read only
const PreferenceList = ({ kind, title, value, options, isLoading, onChange }: PreferenceListProps) => {
    const { t } = useTranslation();
    const tagName = usePreferenceTagName();
    const isFull = value.length >= MAX_TAGS_PER_LIST;
    const tagClassName = `preference-list__tag preference-list__tag--${kind}`;
    const chipProps: ChipProps = { size: "small", deleteIcon: <Close /> };

    // names in both languages are searched, names starting with the typed text come first
    const filterTags = (tags: PreferenceTag[], query: string) => {
        const text = query.trim().toLowerCase();
        const names = (tag: PreferenceTag) => [tag.name, tag.nameRu].map(name => name.toLowerCase());
        const startsWithText = (tag: PreferenceTag) => names(tag).some(name => name.startsWith(text));
        return tags
            .filter(tag => names(tag).some(name => name.includes(text)))
            .sort((first, second) => Number(startsWithText(second)) - Number(startsWithText(first)));
    };

    return(
        <div className="preference-list">
            <div className="preference-list__title">{title}</div>
            {
                onChange ?
                <Autocomplete
                multiple
                openOnFocus
                autoHighlight
                disableClearable
                filterSelectedOptions
                forcePopupIcon={false}
                className="preference-list__input"
                options={isFull ? [] : options}
                value={value}
                loading={isLoading}
                onChange={(_event, tags) => onChange(tags)}
                getOptionLabel={tag => tagName(tag)}
                isOptionEqualToValue={(option, selected) => option.id === selected.id}
                filterOptions={(tags, { inputValue }) => filterTags(tags, inputValue)}
                noOptionsText={isFull ? t("A list holds up to {{count}} tags", { count: MAX_TAGS_PER_LIST }) : t("Nothing found")}
                renderTags={(tags, getTagProps) => tags.map((tag, index) => {
                    // the field gives its own class to every tag, both are kept
                    const { key, className, ...tagProps } = getTagProps({ index });
                    return <Chip key={key} label={tagName(tag)} {...chipProps} {...tagProps} className={`${tagClassName} ${className}`} />;
                })}
                renderInput={(params) =>
                    <TextField {...params} placeholder={value.length ? undefined : t("Start typing a genre or a period")} />
                } />
                :
                <div className="preference-list__box">
                    {
                        value.length ?
                        value.map(tag => <Chip key={tag.id} label={tagName(tag)} {...chipProps} className={tagClassName} />)
                        :
                        <span className="preference-list__empty">{t("Not specified")}</span>
                    }
                </div>
            }
        </div>
    );
};

type PreferenceListProps = {
    kind: PreferenceListKind,
    title: string,
    value: PreferenceTag[],
    options: PreferenceTag[],
    isLoading: boolean,
    // read only without it
    onChange?: (value: PreferenceTag[]) => void
}

export { PreferenceList }
