import { ReactionAddOptions, NewActivity } from 'getstream';
import { CommentStatus, PostStatus, ReactionType } from '@prisma/client';

export interface TagMeta {
    id: string;
    name: string;
}
export enum PostFeedVerb {
    POST = 'POST',
    REACTION = 'REACTION',
    COMMENT = 'COMMENT',
}

export interface PostFeedCreateActivityData {
    id: string;
    uid: string;
    title: string;
    content: string;
    status: PostStatus;
    createdDate: Date;
    updatedDate: Date;
    edited: boolean;
    tags?: { id: string; name: string }[];
    ghillieId: string;
    postedById: string;
}

export interface PostFeedUpdateActivityData {
    title?: string;
    content?: string;
    status?: PostStatus;
    updatedDate: Date;
    edited?: boolean;
    tags?: { id: string; name: string }[];
}
/**
 * This tells the story of a person performing an action on or with an object (post).
 * Ex: "MarkTripoli made a new post in the ghillie 'Ghillie 1'"
 *
 * @actor - The Ghillie or User who performed the action
 */
export type NewPostActivity = NewActivity & {
    // The person who performed the action
    actor: string;
    // The action performed
    verb: PostFeedVerb.POST;
    object: PostFeedVerb.POST;
    // This is the ID of the post .
    foreign_id: string;
    time: string;
    // This is the ghillie that the post was made in
    targetId: string;
    published: string;
    data: PostFeedCreateActivityData;
    // The other streams that should be notified of this activity
    to?: string[];
};

export type NewCommentActivity = {
    kind: 'POST_COMMENT';
    // The ID of the activity (post) the reaction refers to
    postActivityId: string;
    data: {
        sourceId: string;
        postOwnerId: string;
        commentingUserId: string;
        time: string;
        commentId: string;
        reactionCount?: number;
        postId: string;
        content: string;
        status: CommentStatus;
    };
    reactionAddOptions: ReactionAddOptions;
};

export type NewPostReaction = {
    kind: 'POST_REACTION';
    postActivityId: string;
    data: {
        sourceId: string;
        postOwnerId: string;
        reactingUserId: string;
        time: string;
        postId: string;
        reactionId: string;
        reactionType: ReactionType;
    };
    reactionAddOptions: ReactionAddOptions;
};

export type NewPostCommentReaction = {
    kind: 'POST_COMMENT_REACTION';
    commentActivityId: string;
    data: {
        sourceId: string;
        commentId: string;
        reactionId: string;
        commentOwnerId: string;
        reactingUserId: string;
        time: string;
        postId: string;
        reactionType: ReactionType;
    };
    reactionAddOptions: ReactionAddOptions;
};
