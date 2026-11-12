import { useTranslation } from "react-i18next";
import type { PreferenceTag } from "./playersApi";

// the name of a tag or of an aspect of games in the language of the site
export const usePreferenceTagName = () => {
    const { i18n } = useTranslation();
    const isRussian = i18n.resolvedLanguage === "ru";
    return (tag: Pick<PreferenceTag, 'name' | 'nameRu'>) => isRussian ? tag.nameRu : tag.name;
};
