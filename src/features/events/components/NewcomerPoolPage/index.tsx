import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { ImageNotSupportedOutlined } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { resolveImageUrl } from "root/shared/helpers/imageUrl";
import {
    useAddNewcomerPoolGameMutation,
    useGetNewcomerPoolQuery,
    useRemoveNewcomerPoolGameMutation,
    useReplaceNewcomerPoolGameMutation
} from "../../newcomerPoolApi";
import { GamePicker } from "../GamePicker";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

// participants put games for newcomers here while the event gathers players, a newcomer rolls one of them after the start;
// the authors of the games stay hidden, a participant changes only their own ones
const NewcomerPoolPage = ({ event }: EventStageProps) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const navigate = useNavigate();
    // the page is offered right after joining the event, putting a game is optional
    const isJustJoined = !!(useLocation().state as NewcomerPoolPageState | null)?.isJustJoined;
    const pool = useGetNewcomerPoolQuery(event.id, { refetchOnMountOrArgChange: true });
    const [addGame, addGameResult] = useAddNewcomerPoolGameMutation();
    const [replaceGame, replaceGameResult] = useReplaceNewcomerPoolGameMutation();
    const [removeGame] = useRemoveNewcomerPoolGameMutation();
    const [replacedId, setReplacedId] = useState<string | null>(null);

    if(!pool.data) {
        return(
            <div className="newcomer-pool__loader">
                <CircularProgress color="primary" />
            </div>
        );
    }

    const { games, minGames, gamesPerPlayer } = pool.data;
    const canAdd = games.filter(poolGame => poolGame.isMine).length < gamesPerPlayer;

    const pick = async (gameId: string) => {
        if(replacedId) {
            await replaceGame({ eventId: event.id, poolGameId: replacedId, gameId }).unwrap();
            setReplacedId(null);
        } else {
            await addGame({ eventId: event.id, gameId }).unwrap();
        }
    };

    return(
        <div className="newcomer-pool">
            <div className="newcomer-pool__header">
                <h1 className="newcomer-pool__title">{t("Games for newcomers")}</h1>
                <div className="newcomer-pool__description">
                    {t("Players who join after the start get one of these games. Put yours, so they have games to roll.")}
                </div>
                <div className="newcomer-pool__count">
                    {
                        games.length < minGames ?
                        t("Games in the pool: {{count}} of {{min}}", { count: games.length, min: minGames })
                        :
                        t("Games in the pool: {{count}}", { count: games.length })
                    }
                </div>
                <CommonButton onClick={() => navigate(`/guild/${guildId}/event/${event.id}`)}>
                    {isJustJoined ? t("Later") : t("Back to the event")}
                </CommonButton>
            </div>
            <div className="newcomer-pool__games">
                {
                    games.length ?
                    games.map(poolGame =>
                        <div key={poolGame.id} className={`newcomer-pool__game ${poolGame.id === replacedId ? "newcomer-pool__game--replaced" : ""}`}>
                            {
                                poolGame.game.imageUrl ?
                                <img src={resolveImageUrl(poolGame.game.imageUrl)} className="newcomer-pool__cover" alt="" />
                                :
                                <div className="newcomer-pool__cover newcomer-pool__cover--empty">
                                    <ImageNotSupportedOutlined />
                                </div>
                            }
                            <div className="newcomer-pool__game-name">{poolGame.game.name}</div>
                            {
                                poolGame.isMine &&
                                <div className="newcomer-pool__own">
                                    <div className="newcomer-pool__own-label">{t("Your game")}</div>
                                    <div className="newcomer-pool__own-actions">
                                        <CommonButton onClick={() => setReplacedId(poolGame.id)} disabled={poolGame.id === replacedId}>
                                            {t("Replace")}
                                        </CommonButton>
                                        <CommonButton color="error" onClick={() => removeGame({ eventId: event.id, poolGameId: poolGame.id })}>
                                            {t("Remove")}
                                        </CommonButton>
                                    </div>
                                </div>
                            }
                        </div>
                    )
                    :
                    <div className="newcomer-pool__empty">{t("The pool is empty so far")}</div>
                }
            </div>
            {
                canAdd || replacedId ?
                <div className="newcomer-pool__picker">
                    <div className="newcomer-pool__picker-title">
                        {replacedId ? t("Pick a game instead of yours") : t("Put a game into the pool")}
                        {
                            replacedId &&
                            <CommonButton onClick={() => setReplacedId(null)}>{t("Cancel")}</CommonButton>
                        }
                    </div>
                    {/* the picker starts over for another game */}
                    <GamePicker
                    key={replacedId ?? "new"}
                    onPick={pick}
                    isPicking={addGameResult.isLoading || replaceGameResult.isLoading}
                    conflictText={t("This game is already in the pool, pick another one")} />
                </div>
                :
                <div className="newcomer-pool__done">
                    {t("Your game is in the pool. You can replace or remove it until the registration ends.")}
                </div>
            }
        </div>
    );
};

export type NewcomerPoolPageState = {
    isJustJoined: boolean
}

export { NewcomerPoolPage }
