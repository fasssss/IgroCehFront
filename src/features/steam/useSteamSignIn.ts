import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLazyGetSteamSignInLinkQuery } from "./steamApi";

// the sign-in to Steam: the browser leaves the site for Steam, Steam sends it back to returnPath, the current page by default
export const useSteamSignIn = (returnPath?: string) => {
    const location = useLocation();
    const [getSteamSignInLink] = useLazyGetSteamSignInLinkQuery();
    const [isLeaving, setIsLeaving] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const signIn = async () => {
        setIsLeaving(true);
        setIsFailed(false);
        try {
            const { steamSignInLink } = await getSteamSignInLink(returnPath ?? location.pathname + location.search).unwrap();
            window.location.assign(steamSignInLink);
        } catch {
            setIsLeaving(false);
            setIsFailed(true);
        }
    };

    return { signIn, isLeaving, isFailed };
};
