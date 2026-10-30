import { ComponentType } from "react";
import { SteamSignInButton } from "root/features/steam/components/SteamSignInButton";
import { XboxSignInButton } from "root/features/xbox/components/XboxSignInButton";
import { AchievementPlatform } from "../../achievementPlatforms";

// each platform links the account of the player through a sign-in of its own, which comes back to the current page
const SIGN_IN_BUTTONS: Record<AchievementPlatform, ComponentType> = {
    [AchievementPlatform.Steam]: SteamSignInButton,
    [AchievementPlatform.Xbox]: XboxSignInButton,
};

const PlatformSignInButton = ({ platform }: PlatformSignInButtonProps) => {
    const SignInButton = SIGN_IN_BUTTONS[platform];
    return <SignInButton />;
};

type PlatformSignInButtonProps = {
    platform: AchievementPlatform
}

export { PlatformSignInButton }
