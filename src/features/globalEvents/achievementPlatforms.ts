import type { GlobalEventAchievement, PlatformAchievement } from "./globalEventsApi";

// mirrors Application.Enum.AchievementPlatform on backend: where an achievement of a game of a global event is unlocked
export const AchievementPlatform = {
    Steam: 1,
    Xbox: 2,
} as const;

export type AchievementPlatform = typeof AchievementPlatform[keyof typeof AchievementPlatform];

export const ACHIEVEMENT_PLATFORMS: AchievementPlatform[] = [AchievementPlatform.Steam, AchievementPlatform.Xbox];

// the names of the platforms aren't translated, the icons are the ones of icons.svg
export const ACHIEVEMENT_PLATFORM_NAME: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: 'Steam',
    [AchievementPlatform.Xbox]: 'Xbox',
};

export const ACHIEVEMENT_PLATFORM_ICON: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: 'steam-icon',
    [AchievementPlatform.Xbox]: 'xbox-icon',
};

// an achievement the platform gave to the administrator as one chosen for the event
export const toEventAchievement = (achievement: PlatformAchievement, platform: AchievementPlatform): GlobalEventAchievement => ({
    platform,
    apiName: achievement.apiName,
    name: achievement.name,
    nameRu: achievement.nameRu,
    description: achievement.description,
    descriptionRu: achievement.descriptionRu,
    iconUrl: achievement.iconUrl
});
