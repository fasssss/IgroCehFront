// the capsules of the platforms in the profile (layout 20674:3947), by the families the VideoGamesCritic catalog gives;
// an unknown platform gets the neutral capsule
const PLATFORM_COLORS: Record<string, string> = {
    PC: '#c7ba81',
    PlayStation: '#7296e4',
    Xbox: '#81c166',
    Switch: '#ff7b7b',
    Nintendo: '#ff7b7b',
};

export const platformColor = (platform: string): string | undefined => PLATFORM_COLORS[platform];
