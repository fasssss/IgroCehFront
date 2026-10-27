// the badges a global event gives for its passing: every image in src/assets/Achievements is one, so a new file there is a new badge;
// the API keeps the name of the file without the extension
const images = import.meta.glob<string>('/src/assets/Achievements/*.{svg,png,webp}', { eager: true, query: '?url', import: 'default' });

export type Badge = {
    id: string,
    url: string
}

export const BADGES: Badge[] = Object.entries(images)
    .map(([path, url]) => ({ id: path.slice(path.lastIndexOf('/') + 1).replace(/\.[^.]+$/, ''), url }))
    .sort((a, b) => a.id.localeCompare(b.id));

// undefined for a badge whose image is gone from the front
export const badgeUrl = (badgeId: string | null | undefined) => BADGES.find(badge => badge.id === badgeId)?.url;
