import { Inject, Injectable } from '@nestjs/common';
import { GET_STREAM_OPTIONS } from './getstream.constants';
import { GetStreamOptions } from './interfaces';
import {
    NewCommentActivity,
    NewPostActivity,
    NewPostCommentReaction,
    NewPostReaction,
} from '../feed/feed.types';
import {
    connect,
    ReactionAPIResponse,
    StreamClient,
    Activity,
    GetFeedOptions,
    FeedAPIResponse,
    StreamUser,
} from 'getstream';
import { CommentStatus, ReactionType } from '@prisma/client';
import { StreamUserDto } from '../../user/dtos/stream-user.dto';

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
        const feed = this.stream.feed('user', post.actor);

        // Add the activity to the user's feed and send it to the ghillie's feed
        return feed.addActivity({
            ...post,
            to: [`ghillie:${post.ghillieId}`, `user_post:${post.actor}`],
        });
    }

    async addPostComment(
        comment: NewCommentActivity,
    ): Promise<ReactionAPIResponse<any>> {
        // Get the user's feed
        const userFeed = this.stream.feed(
            'user',
            comment.data.commentingUserId,
        );

        const response = userFeed.client.reactions.add(
            comment.kind,
            comment.postActivityId,
            { ...comment.data },
            {
                ...comment.reactionAddOptions,
                targetFeeds: [`notification:${comment.data.postOwnerId}`],
            },
        );

        // Update the post activity to include the comment
        // TODO: This is not working

        return response;
    }

    async updatePostComment(
        reactionId: string,
        content?: string,
        status?: CommentStatus,
    ) {
        return this.stream.reactions.update(reactionId, {
            content,
            status,
        });
    }

    async deletePostComment(reactionId: string) {
        return this.stream.reactions.update(reactionId);
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

    async addPostCommentReaction(
        reaction: NewPostCommentReaction,
    ): Promise<ReactionAPIResponse<any>> {
        // Get the user's feed
        const userFeed = this.stream.feed('user', reaction.data.reactingUserId);

        return userFeed.client.reactions.add(
            reaction.kind,
            reaction.commentActivityId,
            { ...reaction.data },
            {
                ...reaction.reactionAddOptions,
                targetFeeds: [`notification:${reaction.data.commentOwnerId}`],
            },
        );

        // TODO: Add the reaction to the comment activity
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
        const feed = this.stream.feed('user', userId);

        return feed.get(options);
    }

    async getUsersPersonalFeed(
        userId: string,
        options: GetFeedOptions = {},
    ): Promise<FeedAPIResponse> {
        // Get the feed of activities made by the user
        return this.stream.feed('user_post', userId).get(options);
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
