import { igroCehApi } from "root/shared/igroCehApi";
import type { ReviewVisibility } from "./reviewVisibility";

const reviewsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getReview: build.query<ReviewPageObject, string>({
            query: (eventRecordId) => ({ url: '/api/getReview', params: { eventRecordId } }),
            providesTags: (_result, _error, eventRecordId) => [{ type: 'Review', id: eventRecordId }],
        }),
        // published at once, can't be changed after that; the event page shows the review button
        publishReview: build.mutation<void, PublishReviewRequest>({
            query: ({ eventId: _eventId, ...body }) => ({ url: '/api/publishReview', method: 'POST', body }),
            invalidatesTags: (_result, _error, { eventRecordId, eventId }) =>
                [{ type: 'Review', id: eventRecordId }, { type: 'Event', id: eventId }, 'PlayerReviews'],
        }),
        publishReviewReplies: build.mutation<void, PublishReviewRepliesRequest>({
            query: ({ eventId: _eventId, ...body }) => ({ url: '/api/publishReviewReplies', method: 'POST', body }),
            invalidatesTags: (_result, _error, { eventRecordId, eventId }) =>
                [{ type: 'Review', id: eventRecordId }, { type: 'Event', id: eventId }, 'PlayerReviews'],
        }),
        // the author changes who sees the review at any time
        setReviewVisibility: build.mutation<void, SetReviewVisibilityRequest>({
            query: ({ eventId: _eventId, ...body }) => ({ url: '/api/setReviewVisibility', method: 'POST', body }),
            invalidatesTags: (_result, _error, { eventRecordId, eventId }) =>
                [{ type: 'Review', id: eventRecordId }, { type: 'Event', id: eventId }, 'PlayerReviews'],
        }),
        // reviews the player wrote, the newest first
        getPlayerReviews: build.query<GetPlayerReviewsResponse, GetPlayerReviewsRequest>({
            query: ({ userId, guildId }) => ({ url: '/api/getPlayerReviews', params: { userId, guildId: guildId ?? '' } }),
            providesTags: ['PlayerReviews'],
        }),
    })
})

export type ReviewPlayer = {
    id: string,
    userName: string,
    avatarUrl: string | null
}

export type ReviewGame = {
    id: string,
    name: string,
    imageUrl: string | null
}

export type ReviewSectionObject = {
    id: string,
    title: string,
    text: string,
    reply: string | null
}

export type ReviewObject = {
    isRecommended: boolean,
    visibility: ReviewVisibility,
    publishedAt: string,
    // the one who guessed the game answers once
    repliesPublishedAt: string | null,
    sections: ReviewSectionObject[]
}

export type ReviewPageObject = {
    eventRecordId: string,
    eventId: string,
    eventName: string,
    guildId: string,
    game: ReviewGame,
    // the player who passed the game
    author: ReviewPlayer,
    // the player who guessed the game
    guesser: ReviewPlayer,
    isPassed: boolean,
    // empty until the author publishes it
    review: ReviewObject | null
}

export type PublishReviewRequest = {
    eventRecordId: string,
    eventId: string,
    isRecommended: boolean,
    visibility: ReviewVisibility,
    sections: { title: string, text: string }[]
}

export type SetReviewVisibilityRequest = {
    eventRecordId: string,
    eventId: string,
    visibility: ReviewVisibility
}

export type PublishReviewRepliesRequest = {
    eventRecordId: string,
    eventId: string,
    replies: { sectionId: string, text: string }[]
}

export type PlayerReviewObject = {
    eventRecordId: string,
    eventName: string,
    guildName: string,
    guildIconUrl: string | null,
    game: ReviewGame,
    guesser: ReviewPlayer,
    isRecommended: boolean,
    visibility: ReviewVisibility,
    publishedAt: string,
    hasReplies: boolean
}

export type GetPlayerReviewsRequest = {
    userId: string,
    // all shared guilds when empty
    guildId?: string
}

export type GetPlayerReviewsResponse = {
    reviews: PlayerReviewObject[]
}

export const {
    useGetReviewQuery,
    usePublishReviewMutation,
    usePublishReviewRepliesMutation,
    useSetReviewVisibilityMutation,
    useGetPlayerReviewsQuery,
} = reviewsApi;
