import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { useGetPsnTrophiesQuery } from "../../globalEventsApi";
import { AchievementPlatform, toEventAchievement } from "../../achievementPlatforms";
import { AchievementChecklist } from "../AchievementChecklist";
import type { PlatformPickerProps } from "../AchievementPicker";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// mirrors PsnLimits.TryParseTitleRef on backend: the id of a trophy list, the service that keeps it may follow
const TITLE_REF = /^NPWR\d{5,}_\d{2}(\/trophy2?)?$/i;

// the trophies of the game in PSN: PSN has no search of games, so the administrator types the id of the trophy list; the answer names the game
// and adds the service that keeps the list, which is the ref the event is saved with; another list drops the chosen trophies.
// The versions of a game for PS4 and PS5 have lists of their own, one is chosen
const PsnTrophyPicker = ({ titleRef, chosen, onTitleRefChange, onChange }: PlatformPickerProps) => {
    const { t } = useTranslation();
    const [typed, setTyped] = useState("");
    const trophies = useGetPsnTrophiesQuery(titleRef ?? skipToken);
    const trimmed = typed.trim();
    const isTitleRef = TITLE_REF.test(trimmed);

    const chooseTitle = (ref: string | null) => {
        onTitleRefChange(ref);
        onChange([], null);
    };

    const open = (event: FormEvent) => {
        event.preventDefault();
        if(isTitleRef) {
            chooseTitle(trimmed);
        }
    };

    if(titleRef) {
        const anotherGameButton = <CommonButton onClick={() => chooseTitle(null)}>{t("Another game in PSN")}</CommonButton>;
        // the data of the previous game isn't shown while another one loads
        if(!trophies.currentData) {
            return(
                <div className="psn-trophy-picker__message">
                    {
                        trophies.isFetching ?
                        <CircularProgress color="primary" />
                        :
                        <>
                            {
                                errorStatus(trophies.error) === 404 ?
                                t("The trophy list {{titleRef}} isn't found or has no trophies", { titleRef })
                                :
                                t("PSN doesn't answer or is busy, the trophies can be chosen later")
                            }
                            {anotherGameButton}
                        </>
                    }
                </div>
            );
        }

        const { titleRef: savedRef, titleName, achievements } = trophies.currentData;
        return(
            <div className="psn-trophy-picker">
                <div className="psn-trophy-picker__title">
                    <span>{t("The game in PSN: {{name}} · {{titleRef}}", { name: titleName, titleRef: savedRef })}</span>
                    {anotherGameButton}
                </div>
                <AchievementChecklist
                achievements={achievements}
                chosen={chosen.map(achievement => achievement.apiName)}
                onChange={apiNames => onChange(
                    achievements.filter(achievement => apiNames.includes(achievement.apiName)).map(achievement => toEventAchievement(achievement, AchievementPlatform.Psn)),
                    apiNames.length ? { titleRef: savedRef, name: titleName } : null
                )} />
            </div>
        );
    }

    return(
        <div className="psn-trophy-picker">
            <div className="psn-trophy-picker__hint">
                {t("PSN has no search of games: type the id of the trophy list of the game.")}
                {" "}
                {t("The versions of a game for PS4 and PS5 have lists of their own, choose one version.")}
            </div>
            <form className="psn-trophy-picker__search" onSubmit={open}>
                <CommonField
                placeholder={t("The id of the trophy list, e.g. NPWR20188_00")}
                value={typed}
                className="psn-trophy-picker__query"
                onChange={e => setTyped(e.target.value)} />
                <CommonButton disabled={!isTitleRef} onClick={open}>{t("Open")}</CommonButton>
            </form>
            {trimmed && !isTitleRef && <div className="psn-trophy-picker__error">{t("The id of a trophy list looks like NPWR20188_00")}</div>}
        </div>
    );
};

export { PsnTrophyPicker }
