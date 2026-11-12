import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TagPill } from "root/shared/components/TagPill";
import { useGetPlayerPreferencesQuery } from "../../playersApi";
import { usePreferenceTagName } from "../../preferenceTagName";
import { PlayerPreferences } from "../PlayerPreferences";
import './styles.scss';

// "My genres" of the profile hero (layout 20648:802): the preferred tags in green, the avoided ones in red;
// the owner changes both lists in the fields of PlayerPreferences
const ProfileGenres = ({ userId, isOwn, className }: ProfileGenresProps) => {
    const { t } = useTranslation();
    const tagName = usePreferenceTagName();
    const [isEditing, setIsEditing] = useState(false);
    const preferences = useGetPlayerPreferencesQuery(userId);
    const lists = preferences.data;
    const isEmpty = !lists || (!lists.preferred.length && !lists.avoided.length);

    // a player who has told nothing about themselves gets no empty section
    if(!isOwn && isEmpty) {
        return null;
    }

    return(
        <section className={`profile-genres ${className ?? ''}`}>
            <div className="profile-genres__header">
                <h2 className="profile-genres__title">{isOwn ? t('profile.myGenres') : t('profile.genres')}</h2>
                {
                    isOwn &&
                    <button type="button" className="profile-genres__edit" aria-expanded={isEditing} onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? t('profile.done') : t('profile.edit')}
                    </button>
                }
            </div>
            {
                isEditing ?
                <PlayerPreferences userId={userId} className="profile-genres__editor" />
                :
                isEmpty ?
                <div className="profile-genres__empty">{t('Not specified')}</div>
                :
                <ul className="profile-genres__tags">
                    {
                        lists.preferred.map(tag =>
                            <li key={tag.id}>
                                <TagPill variant="tint" tone="success" title={t('I prefer')}>{tagName(tag)}</TagPill>
                            </li>
                        )
                    }
                    {
                        lists.avoided.map(tag =>
                            <li key={tag.id}>
                                <TagPill variant="tint" tone="error" title={t('I avoid')}>
                                    <span className="visually-hidden">{t('I avoid')}:</span>
                                    {tagName(tag)}
                                </TagPill>
                            </li>
                        )
                    }
                </ul>
            }
        </section>
    );
};

type ProfileGenresProps = {
    userId: string,
    isOwn: boolean,
    className?: string
}

export { ProfileGenres }
