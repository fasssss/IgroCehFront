import { useEffect, useState } from "react";
import { TFunction } from "i18next";

// the current time, ticking every second while it is needed
export const useNow = (isTicking: boolean) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if(!isTicking) return;
        // the time of the first render is old by now, e.g. a game was picked long after the page opened
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [isTicking]);
    return now;
};

// "6 d 23:59:12", the days only while there are any
export const formatTimeLeft = (ms: number, t: TFunction) => {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    const days = Math.floor(seconds / 86400);
    const time = [Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
        .map(part => String(part).padStart(2, '0'))
        .join(':');
    return days ? t("{{days}} d {{time}}", { days, time }) : time;
};
