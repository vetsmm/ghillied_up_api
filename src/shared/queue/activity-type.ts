export const ActivityType = {
    POST: 'POST',
    POST_REACTION: 'POST_REACTION',
    POST_COMMENT: 'POST_COMMENT',
    POST_COMMENT_REACTION: 'POST_COMMENT_REACTION',
    POST_COMMENT_REPLY: 'POST_COMMENT_REPLY',
};

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];
