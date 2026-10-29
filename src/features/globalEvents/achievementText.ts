import { useTranslation } from "react-i18next";
import type { GlobalEventAchievement } from "./globalEventsApi";

// the name and the description of an achievement in the language of the site
export const useAchievementText = () => {
    const { i18n } = useTranslation();
    const isRussian = i18n.resolvedLanguage === "ru";
    return (achievement: Pick<GlobalEventAchievement, 'name' | 'nameRu' | 'description' | 'descriptionRu'>) => ({
        name: isRussian ? achievement.nameRu : achievement.name,
        description: isRussian ? achievement.descriptionRu : achievement.description
    });
};
