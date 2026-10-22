// mirrors Domain.Enums.ReviewVisibility on backend, every next value shows the review to more players
export const ReviewVisibility = {
    OnlyAuthor: 0,
    AuthorAndGuesser: 1,
    Guild: 2,
    Everyone: 3,
} as const;

export type ReviewVisibility = typeof ReviewVisibility[keyof typeof ReviewVisibility];

export const REVIEW_VISIBILITY_VALUES: ReviewVisibility[] = [
    ReviewVisibility.OnlyAuthor,
    ReviewVisibility.AuthorAndGuesser,
    ReviewVisibility.Guild,
    ReviewVisibility.Everyone,
];

// names are also used as translation keys
export const REVIEW_VISIBILITY_NAME: Record<ReviewVisibility, string> = {
    [ReviewVisibility.OnlyAuthor]: 'Visible only to me',
    [ReviewVisibility.AuthorAndGuesser]: 'Visible to me and the one who guessed the game',
    [ReviewVisibility.Guild]: 'Visible to the guild',
    [ReviewVisibility.Everyone]: 'Visible to everyone',
};

// the same rule as on the server
export const canSeeReview = (visibility: ReviewVisibility, viewerId: string, authorId: string | undefined, guesserId: string, isGuildMember: boolean) =>
    viewerId === authorId
    || visibility === ReviewVisibility.Everyone
    || (visibility >= ReviewVisibility.AuthorAndGuesser && viewerId === guesserId)
    || (visibility >= ReviewVisibility.Guild && isGuildMember);
