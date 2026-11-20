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
    // from 1 to 10 in steps of 0.5
    score: number,
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
    // from 1 to 10 in steps of 0.5
    score: number,
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
    // from 1 to 10 in steps of 0.5
    score: number,
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
    useGetReviewSuggestionsQuery,
    useGetCommunityReviewsQuery,
} = reviewsApi;
