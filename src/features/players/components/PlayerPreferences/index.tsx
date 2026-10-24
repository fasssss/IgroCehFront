import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCurrentUser } from "root/features/authorization/authorizationApi";
import { useGetPlayerPreferencesQuery, useGetPreferenceTagsQuery, useSetPreferencesMutation } from "../../playersApi";
import { PreferenceList, PreferenceListKind } from "../PreferenceList";
import './styles.scss';

// what the player prefers and avoids: in the profile and on the page where a game is guessed for the player;
// the owner adds tags by typing, others only read them
const PlayerPreferences = ({ userId, className }: PlayerPreferencesProps) => {
    const { t } = useTranslation();
    const isOwn = useCurrentUser()?.id === userId;
    const preferences = useGetPlayerPreferencesQuery(userId, { refetchOnMountOrArgChange: true });
    const tags = useGetPreferenceTagsQuery(isOwn ? undefined : skipToken);
    const [setPreferences, saving] = useSetPreferencesMutation();
    const lists = preferences.data;

    // a player who has told nothing about themselves gets no empty boxes
    if(!lists || (!isOwn && !lists.preferred.length && !lists.avoided.length)) {
        return null;
    }

    const renderList = (kind: PreferenceListKind, title: string) => {
        // a tag of the other list isn't offered: it can't be preferred and avoided at once
        const other = kind === 'preferred' ? lists.avoided : lists.preferred;
        return(
            <PreferenceList
            kind={kind}
            title={title}
            value={lists[kind]}
            options={(tags.data?.tags ?? []).filter(tag => !other.some(otherTag => otherTag.id === tag.id))}
            isLoading={tags.isLoading}
            onChange={isOwn ? (value) => setPreferences({ userId, ...lists, [kind]: value }) : undefined} />
        );
    };

    return(
        <div className={`player-preferences ${className ?? ""}`}>
            {renderList('preferred', t('I prefer'))}
            {renderList('avoided', t('I avoid'))}
            {saving.isError && <div className="player-preferences__error">{t("Couldn't save, try again")}</div>}
        </div>
    );
};

type PlayerPreferencesProps = {
    userId: string,
    // places the block on the page
    className?: string
}

export { PlayerPreferences }
