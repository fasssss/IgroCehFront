import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { skipToken } from "@reduxjs/toolkit/query";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import {
    GlobalEventAchievement,
    XboxTitle,
    useGetXboxAchievementsQuery,
    useLazyGetXboxTitleIdQuery,
    useSearchXboxTitlesQuery
} from "../../globalEventsApi";
import { AchievementPlatform, toEventAchievement } from "../../achievementPlatforms";
import { AchievementChecklist } from "../AchievementChecklist";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

const MIN_QUERY_LENGTH = 2;
const TITLE_ID = /^\d{1,10}$/;

// the achievements of the game in Xbox: the catalog knows no Xbox title ids, so the game is found in the Microsoft Store
// by the name of the catalog game, another name or a title id the administrator types; then its achievements are ticked
// like the Steam ones, another game in Xbox drops the chosen ones; the search gives the title ids of few games,
// the one of the chosen game is looked up then, so each lookup costs a request only for the game that is needed
const XboxAchievementPicker = ({ gameName, titleId, chosen, onTitleIdChange, onChange }: XboxAchievementPickerProps) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState(gameName);
    const [searchedQuery, setSearchedQuery] = useState(gameName.trim());
    const titles = useSearchXboxTitlesQuery(titleId || searchedQuery.length < MIN_QUERY_LENGTH ? skipToken : searchedQuery);
    const achievements = useGetXboxAchievementsQuery(titleId ?? skipToken);
    const [getXboxTitleId, titleIdLookup] = useLazyGetXboxTitleIdQuery();
    const [lookupError, setLookupError] = useState<string | null>(null);

    const chooseTitle = (id: string | null) => {
        setLookupError(null);
        onTitleIdChange(id);
        onChange([], null);
    };

    const pickTitle = async (title: XboxTitle) => {
        if(title.titleId) {
            chooseTitle(title.titleId);
            return;
        }

        if(!title.productId) {
            return;
        }

        setLookupError(null);
        try {
            const { titleId: found } = await getXboxTitleId(title.productId, true).unwrap();
            chooseTitle(found);
        } catch(error) {
            setLookupError(errorStatus(error) === 404
                ? t("{{name}} has no title id in Xbox, it may be a bundle or an add-on. Choose another one", { name: title.name })
                : t("Xbox doesn't answer, the achievements can be chosen later"));
        }
    };

    const search = (event: FormEvent) => {
        event.preventDefault();
        setLookupError(null);
        const value = query.trim();
        if(TITLE_ID.test(value)) {
            chooseTitle(value);
        } else {
            setSearchedQuery(value);
        }
    };

    if(titleId) {
        const anotherGameButton = <CommonButton onClick={() => chooseTitle(null)}>{t("Another game in Xbox")}</CommonButton>;
        // the data of the previous game isn't shown while another one loads
        if(!achievements.currentData) {
            return(
                <div className="xbox-achievement-picker__message">
                    {
                        achievements.isFetching ?
                        <CircularProgress color="primary" />
                        :
                        <>
                            {
                                errorStatus(achievements.error) === 404 ?
                                t("The game {{titleId}} has no achievements in Xbox or there is no such game", { titleId })
                                :
                                t("Xbox doesn't answer, the achievements can be chosen later")
                            }
                            {anotherGameButton}
                        </>
                    }
                </div>
            );
        }

        const { title, achievements: list } = achievements.currentData;
        return(
            <div className="xbox-achievement-picker">
                <div className="xbox-achievement-picker__title">
                    <span>{t("The game in Xbox: {{name}} · title id {{titleId}}", { name: title.name, titleId: title.titleId })}</span>
                    {anotherGameButton}
                </div>
                <AchievementChecklist
                achievements={list}
                chosen={chosen.map(achievement => achievement.apiName)}
                onChange={apiNames => onChange(
                    list.filter(achievement => apiNames.includes(achievement.apiName)).map(achievement => toEventAchievement(achievement, AchievementPlatform.Xbox)),
                    apiNames.length ? { titleId: title.titleId, name: title.name } : null
                )} />
            </div>
        );
    }

    return(
        <div className="xbox-achievement-picker">
            <form className="xbox-achievement-picker__search" onSubmit={search}>
                <CommonField
                placeholder={t("A name in the Microsoft Store or a title id")}
                value={query}
                className="xbox-achievement-picker__query"
                onChange={e => setQuery(e.target.value)} />
                <CommonButton onClick={search}>{t("Find")}</CommonButton>
            </form>
            {
                titles.isFetching ?
                <div className="xbox-achievement-picker__message"><CircularProgress color="primary" /></div>
                : titles.isError ?
                <div className="xbox-achievement-picker__message">{t("Xbox doesn't answer, the achievements can be chosen later")}</div>
                : titles.currentData && !titles.currentData.titles.length ?
                <div className="xbox-achievement-picker__message">
                    {t("The Microsoft Store has no Xbox game with this name. Try another name or type the title id")}
                </div>
                : titles.currentData &&
                <>
                    <div className="xbox-achievement-picker__hint">{lookupError ?? t("Choose the game in Xbox, its achievements open next")}</div>
                    <div className="xbox-achievement-picker__titles">
                        {
                            titles.currentData.titles.map(title =>
                                <button
                                key={title.productId ?? title.titleId}
                                type="button"
                                className="xbox-achievement-picker__candidate"
                                disabled={titleIdLookup.isFetching}
                                onClick={() => pickTitle(title)}>
                                    {
                                        title.imageUrl ?
                                        <img src={title.imageUrl} className="xbox-achievement-picker__cover" alt="" />
                                        :
                                        <span className="xbox-achievement-picker__cover xbox-achievement-picker__cover--empty"><ImageNotSupportedOutlined /></span>
                                    }
                                    <span className="xbox-achievement-picker__name">{title.name}</span>
                                    {
                                        title.titleId &&
                                        <span className="xbox-achievement-picker__id">{t("title id {{titleId}}", { titleId: title.titleId })}</span>
                                    }
                                </button>
                            )
                        }
                    </div>
                </>
            }
        </div>
    );
};

type XboxAchievementPickerProps = {
    // the name of the catalog game, the first search goes with it
    gameName: string,
    // the game in Xbox whose achievements are shown, null while it is looked for
    titleId: string | null,
    // the chosen Xbox achievements
    chosen: GlobalEventAchievement[],
    onTitleIdChange: (titleId: string | null) => void,
    // the title goes with the chosen achievements, it is null without them
    onChange: (chosen: GlobalEventAchievement[], xboxTitle: XboxTitleChoice | null) => void
}

// the game in Xbox the chosen achievements belong to
export type XboxTitleChoice = {
    titleId: string,
    name: string
}

export { XboxAchievementPicker }
