export const NotificationType = {
    POST_SUBSCRIBE: 'POST_SUBSCRIBE',
    POST_COMMENT: 'POST_COMMENT',
    POST: 'POST',
    POST_REACTION: 'POST_REACTION',
    POST_COMMENT_REACTION: 'POST_COMMENT_REACTION',
    ACCOUNT_VERIFY_REMINDER: 'ACCOUNT_VERIFY_REMINDER',
    NEW_GHILLIE_ACTIVITY: 'NEW_GHILLIE_ACTIVITY',
};

export type NotificationType =
    typeof NotificationType[keyof typeof NotificationType];
