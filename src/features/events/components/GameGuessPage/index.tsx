import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CommonButton } from "root/shared/components/CommonButton";
import { useSuggestGameMutation } from "../../eventsApi";
import { GamePicker } from "../GamePicker";
import { PlayerPreferences } from "root/features/players/components/PlayerPreferences";
import type { EventStageProps } from "../EventStageRouter";
import './styles.scss';

// after the game is suggested EventStageRouter switches to the progress page by itself
const GameGuessPage = ({ event, currentUser }: EventStageProps) => {
    const { t } = useTranslation();
    const { guildId } = useParams();
    const navigate = useNavigate();
    const [suggestGame, suggestGameResult] = useSuggestGameMutation();
    const ownRecord = event.eventRecords.find(record => record.participant.id === currentUser.id);

    if(!ownRecord) {
        return null;
    }

    const eventPath = `/guild/${guildId}/event/${event.id}`;
    // a changed game is picked on its own page, so the event page is opened back after it
    const suggest = async (gameId: string) => {
        await suggestGame({ gameId, eventRecordId: ownRecord.id, eventId: event.id }).unwrap();
        navigate(eventPath, { replace: true });
    };

    return(
    <div className="game-guess">
        <div className="game-guess__header">
            <div className="game-guess__user-plate">
                <img src={ownRecord.toUser?.avatarUrl ?? undefined} className="game-guess__user-image" />
                {ownRecord.toUser?.userName}
            </div>
            {/* what the player likes helps to pick a game for them */}
            {ownRecord.toUser && <PlayerPreferences userId={ownRecord.toUser.id} className="game-guess__preferences" />}
            {
                // a guessed game here means the participant came back to change it before the event is activated
                ownRecord.game &&
                <div className="game-guess__change">
                    <div className="game-guess__change-text">
                        {t("Now guessed: {{game}}", { game: ownRecord.game.name })}
                    </div>
                    <CommonButton onClick={() => navigate(eventPath)}>
                        {t("Back to the event")}
                    </CommonButton>
                </div>
            }
        </div>
        {/* a player never gets the same game twice, the server refuses such a game with 409 */}
        <GamePicker
        onPick={suggest}
        isPicking={suggestGameResult.isLoading}
        conflictText={t("This player has already got this game, pick another one")} />
    </div>
    );
}

export { GameGuessPage }
