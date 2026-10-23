import { igroCehApi } from "root/shared/igroCehApi";
import type { ReviewVisibility } from "./reviewVisibility";

const reviewsApi = igroCehApi.injectEndpoints({
    endpoints: (build) => ({
        getReview: build.query<ReviewPageObject, string>({
            query: (eventRecordId) => ({ url: '/api/getReview', params: { eventRecordId } }),
            providesTags: (_result, _error, eventRecordId) => [{ type: 'Review', id: eventRecordId }],
        }),
        // published at once, can't be changed after that
        publishReview: build.mutation<void, PublishReviewRequest>({
            query: (body) => ({ url: '/api/publishReview', method: 'POST', body }),
            invalidatesTags: (_result, _error, { eventRecordId }) => [{ type: 'Review', id: eventRecordId }, 'ReviewLists'],
        }),
        publishReviewReplies: build.mutation<void, PublishReviewRepliesRequest>({
            query: (body) => ({ url: '/api/publishReviewReplies', method: 'POST', body }),
            invalidatesTags: (_result, _error, { eventRecordId }) => [{ type: 'Review', id: eventRecordId }, 'ReviewLists'],
        }),
        // the author changes who sees the review at any time
        setReviewVisibility: build.mutation<void, SetReviewVisibilityRequest>({
            query: (body) => ({ url: '/api/setReviewVisibility', method: 'POST', body }),
            invalidatesTags: (_result, _error, { eventRecordId }) => [{ type: 'Review', id: eventRecordId }, 'ReviewLists'],
        }),
        // reviews the player wrote, the newest first
        getPlayerReviews: build.query<GetPlayerReviewsResponse, GetPlayerReviewsRequest>({
            query: ({ userId, guildId }) => ({ url: '/api/getPlayerReviews', params: { userId, guildId: guildId ?? '' } }),
            providesTags: ['ReviewLists'],
        }),
        // passed games to review and guessed games whose reviews wait for answers
        getReviewSuggestions: build.query<GetReviewSuggestionsResponse, void>({
            query: () => ({ url: '/api/getReviewSuggestions' }),
            providesTags: ['ReviewLists'],
        }),
        // the newest reviews the user can read, the list grows by asking for more of them
        getCommunityReviews: build.query<GetCommunityReviewsResponse, number>({
            query: (count) => ({ url: '/api/getCommunityReviews', params: { count } }),
            providesTags: ['ReviewLists'],
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
    isRecommended: boolean,
    visibility: ReviewVisibility,
    sections: { title: string, text: string }[]
}

export type SetReviewVisibilityRequest = {
    eventRecordId: string,
    visibility: ReviewVisibility
}

export type PublishReviewRepliesRequest = {
    eventRecordId: string,
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

export type ReviewSuggestion = {
    eventRecordId: string,
    eventName: string,
    game: ReviewGame
}

export type GetReviewSuggestionsResponse = {
    toWrite: ReviewSuggestion[],
    toAnswer: ReviewSuggestion[]
}

export type CommunityReviewObject = {
    eventRecordId: string,
    game: ReviewGame,
    author: ReviewPlayer,
    isRecommended: boolean,
    publishedAt: string
}

export type GetCommunityReviewsResponse = {
    reviews: CommunityReviewObject[],
    hasMore: boolean
}

export const {
    useGetReviewQuery,
    usePublishReviewMutation,
    usePublishReviewRepliesMutation,
    useSetReviewVisibilityMutation,
    useGetPlayerReviewsQuery,
    useGetReviewSuggestionsQuery,
    useGetCommunityReviewsQuery,
} = reviewsApi;
