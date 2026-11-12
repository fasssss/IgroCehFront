import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import './styles.scss';

// a section of the side column of the profile hero (layout 20648:773): the title and, for the owner, the switch of the editor;
// the content goes under them, `profile-section__tags` and `profile-section__empty` give it the look of the layout
const ProfileSection = ({ title, isEditing = false, onEditToggle, className, children }: PropsWithChildren<ProfileSectionProps>) => {
    const { t } = useTranslation();

    return(
        <section className={`profile-section ${className ?? ''}`}>
            <div className="profile-section__header">
                <h2 className="profile-section__title">{title}</h2>
                {
                    onEditToggle &&
                    <button type="button" className="profile-section__edit" aria-expanded={isEditing} onClick={onEditToggle}>
                        {isEditing ? t('profile.done') : t('profile.edit')}
                    </button>
                }
            </div>
            {children}
        </section>
    );
};

type ProfileSectionProps = {
    title: string,
    isEditing?: boolean,
    // the section can't be edited without it
    onEditToggle?: () => void,
    className?: string
}

export { ProfileSection }
