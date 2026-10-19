import { igroCehApiBaseUrl } from "root/shared/constants";

// uploaded images are stored as paths on our API, catalog images come as full urls
export const resolveImageUrl = (imageUrl: string | null | undefined) => {
    if(!imageUrl) {
        return undefined;
    }

    return /^https?:\/\//i.test(imageUrl) ? imageUrl : igroCehApiBaseUrl + imageUrl;
};
