import { Inject, Injectable } from '@nestjs/common';
import { GET_STREAM_OPTIONS } from './getstream.constants';
import { GetStreamOptions } from './interfaces';
import {
    NewCommentActivity,
    NewCommentReply,
    NewFlagActivity,
    NewPostActivity,
    NewPostBookmarkActivity,
    NewPostCommentReaction,
    NewPostReaction,
    UpdateCommentReply,
    UpdateParentComment,
} from '../feed/feed.types';
import {
    Activity,
    connect,
    DefaultGenerics,
    FeedAPIResponse,
    GetActivitiesAPIResponse,
    GetFeedOptions,
    ReactionAPIResponse,
    ReactionFilterAPIResponse,
    StreamClient,
    StreamUser,
    UpdateActivity,
} from 'getstream';
import { CommentStatus, ReactionType } from '@prisma/client';
import { StreamUserDto } from '../../user/dtos/stream-user.dto';
import { ActivityType } from '../queue/activity-type';

@Injectable()
export class GetStreamService {
    public stream: StreamClient;

    constructor(
        @Inject(GET_STREAM_OPTIONS) private _GetStreamOptions: GetStreamOptions,
    ) {
        this.stream = connect(
            this._GetStreamOptions.apiKey,
            this._GetStreamOptions.apiSecret,
            this._GetStreamOptions.appId,
            this._GetStreamOptions.clientOptions,
        );
    }

    createAccessToken(userId: string): string {
        return this.stream.createUserToken(userId);
    }

    async getUser(userId: string): Promise<StreamUser> {
        return this.stream.user(userId).get();
    }

    async createUser(user: StreamUserDto): Promise<StreamUser> {
        await this.stream.feed('user', user.id).follow(`user_post`, user.id);
        return this.stream.user(user.id).create({
            ...user,
        });
    }

    async updateUser(user: StreamUserDto): Promise<StreamUser> {
        return this.stream.user(user.id).update({
            ...user,
        });
    }

    async deleteUser(userId: string) {
        await this.stream.feed('user', userId).unfollow(`user_post`, userId);
        return this.stream.user(userId).delete();
    }

    async followGhillie(ghillieId: string, userId: string) {
        // This is the feed group
        const userFeed = this.stream.feed('user', userId);

        // Now we want to follow the ghillie's feed
        return userFeed.follow('ghillie', ghillieId);
    }

    async unfollowGhillie(ghillieId: string, userId: string) {
        // This is the feed group
        const userFeed = this.stream.feed('user', userId);

        // Now we want to unfollow the ghillie's feed
        return userFeed.unfollow('ghillie', ghillieId);
    }

    async addPostActivity(post: NewPostActivity): Promise<Activity> {
        // Get the user's feed
        return this.stream.feed('user', post.actor).addActivity({
            ...post,
            to: [
                `ghillie:${post.data.ghillieId}`,
                `user_post:${post.actor}`,
                'post_admin:ALL',
                ...post.data.tags.map((tag) => `post_tag:${tag.name}`),
            ],
        });
    }

    async getPostActivity(userId: string, activityId: string) {
        return this.stream.feed('user', userId).get({
            id_gte: activityId,
            limit: 1,
        });
    }

    async addFlagActivity(
        feedGroup: 'flag_post' | 'flag_ghillie' | 'flag_comment',
        flag: NewFlagActivity,
    ): Promise<Activity> {
        return this.stream.feed(feedGroup, flag.actor).addActivity({
            ...flag,
            to: [`${feedGroup}:ALL`],
        });
    }

    async bookmarkPost(bookmark: NewPostBookmarkActivity): Promise<Activity> {
        return this.stream
            .feed('user_post_bookmark', bookmark.actor)
            .addActivity({
                ...bookmark,
            });
    }

    async unbookmarkPost(userId: string, activityId: string) {
        return this.stream
            .feed('user_post_bookmark', userId)
            .removeActivity(activityId);
    }

    async getPostActivities(
        activityIds: Array<string>,
    ): Promise<GetActivitiesAPIResponse> {
        return this.stream.getActivities({
            ids: activityIds,
        });
    }

    async deletePostActivity(userId: string, postId: string) {
        return this.stream.feed('user', userId).removeActivity({
            foreign_id: `post:${postId}`,
        });
    }

    async updatePostActivity(activity: UpdateActivity<any>) {
        await this.stream
            .feed('user', activity.actor)
            .updateActivityToTargets(activity.foreign_id, activity.time, [
                ...activity.data.tags.map((tag) => `post_tag:${tag.name}`),
            ]);
        return this.stream.updateActivity(activity);
    }

    async addPostComment(
        comment: NewCommentActivity,
    ): Promise<ReactionAPIResponse<any>> {
        // Get the user's feed
        const userFeed = this.stream.feed(
            'user',
            comment.data.commentingUserId,
        );

        return userFeed.client.reactions.add(
            comment.kind,
            comment.postActivityId,
            { ...comment.data },
            {
                ...comment.reactionAddOptions,
                targetFeeds: [`notification:${comment.data.postOwnerId}`],
            },
        );
    }

    async createChildPostComment(
        commentReply: NewCommentReply,
    ): Promise<ReactionAPIResponse<any>> {
        return this.stream.reactions.addChild(
            ActivityType.POST_COMMENT_REPLY,
            commentReply.parentCommentReactionId,
            { ...commentReply.data },
            {
                ...commentReply.reactionAddOptions,
            },
        );
    }

    async updateComment(
        updatedComment: UpdateCommentReply | UpdateParentComment,
    ) {
        return this.stream.reactions.update(
            updatedComment.reactionId,
            { ...updatedComment.data },
            updatedComment.reactionUpdateOptions,
        );
    }

    async getComment(activityId: string) {
        return this.stream.reactions.get(activityId);
    }

    async deletePostComment(reactionId: string) {
        return this.stream.reactions.delete(reactionId);
    }

    async addPostReaction(
        reaction: NewPostReaction,
    ): Promise<ReactionAPIResponse<any>> {
        // Get the user's feed
        const userFeed = this.stream.feed('user', reaction.data.reactingUserId);

        return userFeed.client.reactions.add(
            reaction.kind,
            reaction.postActivityId,
            { ...reaction.data },
            {
                ...reaction.reactionAddOptions,
                targetFeeds: [`notification:${reaction.data.postOwnerId}`],
            },
        );
    }

    async updatePostReaction(reactionId: string, reactionType: ReactionType) {
        return this.stream.reactions.update(reactionId, { reactionType });
    }

    async deletePostReaction(reactionId: string) {
        return this.stream.reactions.delete(reactionId);
    }

    async addCommentReaction(
        reaction: NewPostCommentReaction,
    ): Promise<ReactionAPIResponse<any>> {
        return this.stream.reactions.addChild(
            ActivityType.POST_COMMENT_REACTION,
            reaction.commentActivityId,
            { ...reaction.data },
            {
                ...reaction.reactionAddOptions,
                targetFeeds: [`notification:${reaction.data.commentOwnerId}`],
            },
        );
    }

    async addCommentReplyReaction(
        reaction: NewPostCommentReaction,
    ): Promise<ReactionAPIResponse<any>> {
        return this.stream.reactions.addChild(
            ActivityType.POST_COMMENT_REACTION,
            reaction.commentActivityId,
            { ...reaction.data },
            {
                ...reaction.reactionAddOptions,
                targetFeeds: [`notification:${reaction.data.commentOwnerId}`],
            },
        );
    }

    async updatePostCommentReaction(
        reactionId: string,
        reactionType: ReactionType,
    ) {
        return this.stream.reactions.update(reactionId, { reactionType });
    }

    async deletePostCommentReaction(reactionId: string) {
        return this.stream.reactions.delete(reactionId);
    }

    async getGhillieFeed(
        ghillieId: string,
        options: GetFeedOptions,
    ): Promise<FeedAPIResponse<any>> {
        return this.stream.feed('ghillie', ghillieId).get(options);
    }

    /**
     * Feeds Reading
     */
    async getFeed(
        userId: string,
        options: GetFeedOptions = {},
    ): Promise<FeedAPIResponse> {
        return this.stream.feed('user', userId).get(options);
    }

    async getHashtagFeed(tagName: string, options: GetFeedOptions = {}) {
        return this.stream.feed('post_tag', tagName).get(options);
    }

    async getUsersPersonalFeed(
        userId: string,
        options: GetFeedOptions = {},
    ): Promise<FeedAPIResponse> {
        // Get the feed of activities made by the user
        return this.stream.feed('user_post', userId).get(options);
    }

    async getBookmarkPostFeed(
        userId: string,
        options: GetFeedOptions = {},
    ): Promise<FeedAPIResponse> {
        return this.stream.feed('user_post_bookmark', userId).get(options);
    }

    async getNotificationFeed(
        userId: string,
        options: GetFeedOptions = {},
    ): Promise<FeedAPIResponse> {
        const feed = this.stream.feed('notification', userId);

        return feed.get({
            ...options,
            mark_seen: true,
            enrich: true,
        });
    }

    async getCommentsForPost(
        postActivityId: string,
        options: GetFeedOptions = {},
    ): Promise<ReactionFilterAPIResponse<DefaultGenerics>> {
        return this.stream.reactions.filter({
            activity_id: postActivityId,
            kind: 'POST_COMMENT',
            ...options,
        });
    }

    async getCommentReplies(
        commentReactionId: string,
        options: GetFeedOptions = {},
    ): Promise<ReactionFilterAPIResponse> {
        return this.stream.reactions.filter({
            reaction_id: commentReactionId,
            kind: 'POST_COMMENT_REPLY',
            ...options,
        });
    }

    async markAsRead(userId: string, activityIds: string[]) {
        return this.stream
            .feed('notification', userId)
            .get({ mark_read: activityIds });
    }

    async markAllAsRead(userId: string) {
        return this.stream
            .feed('notification', userId)
            .get({ mark_read: true });
    }
}
