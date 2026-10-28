import { igroCehApiBaseUrl } from "root/shared/constants";

// the badges a global event gives for its passing are uploaded by the administrator and kept by the API;
// the image of a badge never changes, so the browser keeps it for good
export const badgeImageUrl = (badgeId: string) => `${igroCehApiBaseUrl}/api/getBadgeImage?badgeId=${encodeURIComponent(badgeId)}`;
