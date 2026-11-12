import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLazyGetXboxSignInLinkQuery } from "./xboxApi";
import { rememberXboxLink } from "./xboxPaths";

// the sign-in to Xbox: the browser leaves the site for OpenXBL and Microsoft,
// the tab remembers returnPath (the current page by default) to come back to it
export const useXboxSignIn = (returnPath?: string) => {
    const location = useLocation();
    const [getXboxSignInLink] = useLazyGetXboxSignInLinkQuery();
    const [isLeaving, setIsLeaving] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const signIn = async () => {
        setIsLeaving(true);
        setIsFailed(false);
        try {
            const { xboxSignInLink } = await getXboxSignInLink().unwrap();
            rememberXboxLink(returnPath ?? location.pathname + location.search);
            window.location.assign(xboxSignInLink);
        } catch {
            setIsLeaving(false);
            setIsFailed(true);
        }
    };

    return { signIn, isLeaving, isFailed };
};
