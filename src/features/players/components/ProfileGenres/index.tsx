import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TagPill } from "root/shared/components/TagPill";
import { useGetPlayerPreferencesQuery } from "../../playersApi";
import { usePreferenceTagName } from "../../preferenceTagName";
import { PlayerPreferences } from "../PlayerPreferences";
import { ProfileSection } from "../ProfileSection";
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
        <ProfileSection
            title={isOwn ? t('profile.myGenres') : t('profile.genres')}
            isEditing={isEditing}
            onEditToggle={isOwn ? () => setIsEditing(!isEditing) : undefined}
            className={`profile-genres ${className ?? ''}`}
        >
            {
                isEditing ?
                <PlayerPreferences userId={userId} className="profile-genres__editor" />
                :
                isEmpty ?
                <div className="profile-section__empty">{t('Not specified')}</div>
                :
                <ul className="profile-section__tags">
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
        </ProfileSection>
    );
};

type ProfileGenresProps = {
    userId: string,
    isOwn: boolean,
    className?: string
}

export { ProfileGenres }
