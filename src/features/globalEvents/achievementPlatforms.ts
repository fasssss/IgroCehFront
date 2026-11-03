import type { UserObject } from "root/features/authorization/authorizationApi";
import type {
    GlobalEvent,
    GlobalEventAchievement,
    GlobalEventParticipationResponse,
    GlobalEventResponse,
    PlatformAchievement
} from "./globalEventsApi";

// mirrors Application.Enum.AchievementPlatform on backend: where an achievement of a game of a global event is unlocked
export const AchievementPlatform = {
    Steam: 1,
    Xbox: 2,
} as const;

export type AchievementPlatform = typeof AchievementPlatform[keyof typeof AchievementPlatform];

// in the order of their values, as the API orders the achievements; built from the values, so a new platform isn't forgotten
export const ACHIEVEMENT_PLATFORMS: AchievementPlatform[] = Object.values(AchievementPlatform).sort((a, b) => a - b);

// a platform of a newer API this front doesn't know yet (e.g. after the front is rolled back) has no name, icon or picker here
export const isAchievementPlatform = (platform: number): platform is AchievementPlatform =>
    (ACHIEVEMENT_PLATFORMS as number[]).includes(platform);

// the names of the platforms aren't translated, the icons are the ones of icons.svg
export const ACHIEVEMENT_PLATFORM_NAME: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: 'Steam',
    [AchievementPlatform.Xbox]: 'Xbox',
};

export const ACHIEVEMENT_PLATFORM_ICON: Record<AchievementPlatform, string> = {
    [AchievementPlatform.Steam]: 'steam-icon',
    [AchievementPlatform.Xbox]: 'xbox-icon',
};

// mirrors Application.Consts.CatalogIds on backend: the catalog id of a game in Steam is its Steam app id,
// a game outside Steam (Ninja Gaiden 3 is only on consoles) has an id of the catalog from this one on
const FIRST_OUTSIDE_STEAM_ID = 1_000_000_000;

export const isSteamAppId = (appId: number) => appId > 0 && appId < FIRST_OUTSIDE_STEAM_ID;

// whether the platform can have the achievements of the catalog game; the constructor opens on the first such one
export const ACHIEVEMENT_PLATFORM_AVAILABLE: Record<AchievementPlatform, (appId: number) => boolean> = {
    [AchievementPlatform.Steam]: isSteamAppId,
    [AchievementPlatform.Xbox]: () => true,
};

// the account of the player on the platform, null while it isn't linked
const ACHIEVEMENT_PLATFORM_ACCOUNT: Record<AchievementPlatform, (user: UserObject) => string | null> = {
    [AchievementPlatform.Steam]: user => user.steamId,
    [AchievementPlatform.Xbox]: user => user.xboxGamertag,
};

export const isLinkedOn = (user: UserObject, platform: AchievementPlatform) => !!ACHIEVEMENT_PLATFORM_ACCOUNT[platform](user);

// any game of the event can be passed by an achievement on the platform
export const hasAchievementsOn = (globalEvent: GlobalEvent, platform: AchievementPlatform) =>
    globalEvent.games.some(game => game.achievements.some(achievement => achievement.platform === platform));

// the platforms the player may link to have the passing of the games of the event checked by itself
export const platformsToLink = (globalEvent: GlobalEvent, user: UserObject) =>
    ACHIEVEMENT_PLATFORMS.filter(platform => hasAchievementsOn(globalEvent, platform) && !isLinkedOn(user, platform));

// the data of the platforms this front doesn't know is left out of the answers of the API, so nothing renders them
export const withKnownPlatforms = ({ globalEvent }: GlobalEventResponse): GlobalEventResponse => ({
    globalEvent: globalEvent && {
        ...globalEvent,
        games: globalEvent.games.map(game => ({
            ...game,
            titles: game.titles.filter(title => isAchievementPlatform(title.platform)),
            achievements: game.achievements.filter(achievement => isAchievementPlatform(achievement.platform))
        }))
    }
});

export const withKnownCheckPlatforms = <TResponse extends GlobalEventParticipationResponse>(response: TResponse): TResponse => ({
    ...response,
    participation: response.participation && {
        ...response.participation,
        passingChecks: response.participation.passingChecks.filter(check => isAchievementPlatform(check.platform))
    }
});

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
