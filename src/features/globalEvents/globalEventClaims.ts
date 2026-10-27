import { steamProfileUrl } from "root/features/steam/steamPaths";

// mirrors Application.Enum.ClaimPlatform on backend: where the player shows the passing of the picked game
export const ClaimPlatform = {
    Psn: 1,
    XboxLive: 2,
    Steam: 3,
} as const;

export type ClaimPlatform = typeof ClaimPlatform[keyof typeof ClaimPlatform];

export const CLAIM_PLATFORMS: ClaimPlatform[] = [ClaimPlatform.Psn, ClaimPlatform.XboxLive, ClaimPlatform.Steam];

// the names of the platforms aren't translated
export const CLAIM_PLATFORM_NAME: Record<ClaimPlatform, string> = {
    [ClaimPlatform.Psn]: 'PSN',
    [ClaimPlatform.XboxLive]: 'Xbox Live',
    [ClaimPlatform.Steam]: 'Steam',
};

// mirrors Application.Enum.ClaimStatus on backend
export const ClaimStatus = {
    Pending: 0,
    Approved: 1,
    Rejected: 2,
} as const;

export type ClaimStatus = typeof ClaimStatus[keyof typeof ClaimStatus];

// mirrors Application.Enum.PassingCheckResult on backend: what Steam says about the picked game
export const PassingCheck = {
    Passed: 0,
    NotPassed: 1,
    // a chosen achievement was unlocked before the pick, it doesn't count
    UnlockedBeforePick: 2,
    ProfileHidden: 3,
} as const;

export type PassingCheck = typeof PassingCheck[keyof typeof PassingCheck];

// the administrator opens the profile of a claim: a typed link as it is, a name on the site that lists the trophies
// or the achievements of the platform
export const claimProfileUrl = (platform: ClaimPlatform, profile: string) => {
    if(/^https?:\/\//i.test(profile)) {
        return profile;
    }

    const name = encodeURIComponent(profile.trim());
    switch(platform) {
        case ClaimPlatform.Psn:
            return `https://psnprofiles.com/${name}`;
        case ClaimPlatform.XboxLive:
            return `https://www.trueachievements.com/gamer/${name}`;
        default:
            return /^\d{17}$/.test(profile.trim()) ? steamProfileUrl(profile.trim()) : `https://steamcommunity.com/id/${name}`;
    }
};
