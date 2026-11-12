import { useState } from "react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { TagPill } from "root/shared/components/TagPill";
import { GameAspect, useGetGameAspectsQuery, useGetPlayerPreferencesQuery, useSetLikedAspectsMutation } from "../../playersApi";
import { usePreferenceTagName } from "../../preferenceTagName";
import { ProfileSection } from "../ProfileSection";
import './styles.scss';

// mirrors PreferenceLimits.MaxLikedAspects on backend
const MAX_LIKED_ASPECTS = 6;

// "What I like in games" of the profile hero (layout 20648:790): gray capsules in the order the player added them;
// the owner switches the aspects of the catalog on and off, every change is saved at once
const ProfileAspects = ({ userId, isOwn, className }: ProfileAspectsProps) => {
    const { t } = useTranslation();
    const aspectName = usePreferenceTagName();
    const [isEditing, setIsEditing] = useState(false);
    const preferences = useGetPlayerPreferencesQuery(userId);
    // the owner gets the catalog beforehand, so the editor opens full
    const catalog = useGetGameAspectsQuery(isOwn ? undefined : skipToken);
    const [setLikedAspects, saving] = useSetLikedAspectsMutation();
    const liked = preferences.data?.likedAspects ?? [];
    const isFull = liked.length >= MAX_LIKED_ASPECTS;

    // a player who has told nothing about themselves gets no empty section
    if(!isOwn && !liked.length) {
        return null;
    }

    // a new aspect goes to the end, so the order stays the one the player added them in
    const toggle = (aspect: GameAspect) => {
        const isLiked = liked.some(likedAspect => likedAspect.id === aspect.id);
        setLikedAspects({
            userId,
            likedAspects: isLiked ? liked.filter(likedAspect => likedAspect.id !== aspect.id) : [...liked, aspect]
        });
    };

    const renderEditor = () => {
        return(
            <div className="profile-aspects__editor">
                <ul className="profile-section__tags">
                    {
                        catalog.data?.aspects.map(aspect => {
                            const isLiked = liked.some(likedAspect => likedAspect.id === aspect.id);
                            return(
                                <li key={aspect.id}>
                                    <button type="button" className="profile-aspects__option" aria-pressed={isLiked}
                                        disabled={!isLiked && isFull} onClick={() => toggle(aspect)}
                                    >
                                        <TagPill>{aspectName(aspect)}</TagPill>
                                    </button>
                                </li>
                            );
                        })
                    }
                </ul>
                <div className="profile-aspects__hint">{t('profile.aspectsLimit', { count: MAX_LIKED_ASPECTS })}</div>
                {catalog.isError && <div className="profile-aspects__error" role="alert">{t('profile.aspectsLoadError')}</div>}
                {saving.isError && <div className="profile-aspects__error" role="alert">{t("Couldn't save, try again")}</div>}
            </div>
        );
    };

    return(
        <ProfileSection
            title={isOwn ? t('profile.myLikedAspects') : t('profile.likedAspects')}
            isEditing={isEditing}
            onEditToggle={isOwn ? () => setIsEditing(!isEditing) : undefined}
            className={className}
        >
            {
                isEditing ?
                renderEditor()
                :
                liked.length ?
                <ul className="profile-section__tags">
                    {liked.map(aspect => <li key={aspect.id}><TagPill>{aspectName(aspect)}</TagPill></li>)}
                </ul>
                :
                <div className="profile-section__empty">{t('Not specified')}</div>
            }
        </ProfileSection>
    );
};

type ProfileAspectsProps = {
    userId: string,
    isOwn: boolean,
    className?: string
}

export { ProfileAspects }
