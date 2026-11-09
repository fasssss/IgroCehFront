import { ComponentType } from "react";
import { SteamSignInButton } from "root/features/steam/components/SteamSignInButton";
import { XboxSignInButton } from "root/features/xbox/components/XboxSignInButton";
import { PsnLinkButton } from "root/features/psn/components/PsnLinkButton";
import { AchievementPlatform } from "../../achievementPlatforms";

// each platform links the account of the player in its own way and comes back to the current page
const SIGN_IN_BUTTONS: Record<AchievementPlatform, ComponentType> = {
    [AchievementPlatform.Steam]: SteamSignInButton,
    [AchievementPlatform.Xbox]: XboxSignInButton,
    // PSN has no sign-in for other sites, its button opens the page of the link on the site
    [AchievementPlatform.Psn]: PsnLinkButton,
};

const PlatformSignInButton = ({ platform }: PlatformSignInButtonProps) => {
    const SignInButton = SIGN_IN_BUTTONS[platform];
    return <SignInButton />;
};

type PlatformSignInButtonProps = {
    platform: AchievementPlatform
}

export { PlatformSignInButton }
