import type { PillItem } from "root/shared/components/Pills";

// brand colors of platforms from VideoGamesCritic, unknown platforms get the default pill color
const PLATFORM_COLORS: Record<string, string> = {
    PC: '#1b2838',
    PlayStation: '#0070d1',
    Xbox: '#107c10',
    Switch: '#e60012',
};

export const toPlatformPills = (platforms: string[]): PillItem[] =>
    platforms.map(platform => ({ label: platform, color: PLATFORM_COLORS[platform] }));
