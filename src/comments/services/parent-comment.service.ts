import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    Action,
    Actor,
    AppLogger,
    CommentDetailDto,
    CreateCommentDto,
    RequestContext,
    UpdateCommentDto,
} from '../../shared';
import { QueueService } from '../../queue/services/queue.service';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { CommentAclService } from './comment-acl.service';
import {
    CommentStatus,
    MemberStatus,
    NotificationType,
    Post,
    PostComment,
    ReactionType,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ActivityType } from '../../shared/queue/activity-type';
import { ReactionAPIResponse } from 'getstream';
import { ParentCommentDto } from '../dtos/parent-comment.dto';
import { ChildCommentDto } from '../dtos/child-comment.dto';

@Injectable()
export class ParentCommentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly aclService: CommentAclService,
        private readonly queueService: QueueService,
        private readonly streamService: GetStreamService,
        private readonly notificationService: NotificationService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(ParentCommentService.name);
    }

    async createPostComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
    ) {
        this.logger.log(ctx, `${this.createPostComment.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Create);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to create comments in this Ghillie',
            );
        }

        // Check if user is member of the ghillie, from which the post belongs
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                ghillie: {
                    posts: {
                        some: {
                            id: createPostCommentInput.postId,
                        },
                    },
                },
                userId: ctx.user.id,
                memberStatus: MemberStatus.ACTIVE,
            },
        });

        if (!ghillieMember) {
            throw new Error(
                'User is not a member of the ghillie and cannot comment on this post',
            );
        }

        const comment = await this.createParentComment(
            ctx,
            createPostCommentInput,
        );

        return plainToInstance(CommentDetailDto, comment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async updatePostComment(
        ctx: RequestContext,
        commentId: string,
        updatePostCommentInput: UpdateCommentDto,
    ) {
        this.logger.log(ctx, `${this.updatePostComment.name} was called`);

        const comment = await this.prisma.postComment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            throw new Error('Comment does not exist.');
        }

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Update, comment);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to update this comment',
            );
        }

        const updatedComment = this.prisma.postComment.update({
            where: {
                id: commentId,
            },
            data: {
                content: updatePostCommentInput.content || comment.content,
                status: updatePostCommentInput.status || comment.status,
                edited: true,
            },
            include: {
                createdBy: true,
                _count: {
                    select: {
                        commentReaction: true,
                    },
                },
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        try {
            await this.streamService.updatePostComment(
                comment.activityId,
                updatePostCommentInput.content,
                updatePostCommentInput.status,
            );
        } catch (error) {
            this.logger.error(
                ctx,
                `Error updating post comment in stream: ${error}`,
            );
        }

        return plainToInstance(CommentDetailDto, updatedComment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deletePostComment(ctx: RequestContext, commentId: string) {
        this.logger.log(ctx, `${this.deletePostComment.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Delete);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to delete a comment in this ghillie',
            );
        }

        const comment = await this.prisma.postComment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            throw new Error('Comment does not exist');
        }

        // delete all children
        await this.prisma.$transaction(async (prisma) => {
            await prisma.postComment.deleteMany({
                where: {
                    id: {
                        in: comment.childCommentIds,
                    },
                },
            });

            // delete the parent comment
            await prisma.postComment.delete({
                where: {
                    id: commentId,
                },
            });
        });

        try {
            await this.streamService.deletePostComment(comment.activityId);
        } catch (error) {
            this.logger.error(
                ctx,
                `Failed to delete comment from feed - ${error.message}`,
            );
        }
    }

    async getParentCommentFeed(
        ctx: RequestContext,
        postId: string,
        limit = 10,
        page = 1,
    ): Promise<ParentCommentDto[]> {
        this.logger.log(ctx, `${this.getParentCommentFeed.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to read comments for this post',
            );
        }

        const post: Post = await this.pg.oneOrNone(
            'SELECT * FROM post WHERE id = $1',
            postId,
        );

        if (!post) {
            throw new Error('Post does not exist');
        }

        const commentResponse = await this.streamService.getCommentsForPost(
            post.activityId,
            {
                limit: limit,
                offset: (page - 1) * limit,
                withReactionCounts: true,
                withOwnReactions: true,
            },
        );

        const resultData: ParentCommentDto[] = commentResponse.results.map(
            (comment) => {
                const latestReplies =
                    comment?.latest_children?.POST_COMMENT_REPLY;
                return {
                    id: comment.data.commentId,
                    content: comment.data.content,
                    status: comment.data.status,
                    createdDate: comment.data.time,
                    createdBy: {
                        ...comment.user.data,
                    },
                    edited: comment.data.edited || false,
                    postId: postId,
                    numberOfReactions:
                        comment?.children_counts?.POST_COMMENT_REACTION || 0,
                    commentReplyCount:
                        comment?.children_counts?.POST_COMMENT_REPLY || 0,
                    latestChildComments: [
                        ...latestReplies?.map((childComment) =>
                            this.getLatestChildComments(
                                ctx,
                                comment.data.id,
                                childComment,
                            ),
                        ),
                    ],
                } as ParentCommentDto;
            },
        );

        // get the parentComment ids
        const parentCommentIds = resultData.map((comment) => comment.id);

        // hydrate in the current user reactions for parent comments
        const currentUserParentCommentReactions =
            await this.hydrateCurrentUserReactions(ctx, parentCommentIds);

        // get the child comment ids from all the parent comments
        const childCommentIds = resultData
            .map((comment) => comment.latestChildComments)
            .flat()
            .map((comment) => comment.id);

        // hydrate in the current user reactions for child comments
        const currentUserChildCommentReactions =
            await this.hydrateCurrentUserReactions(ctx, childCommentIds);

        // Fill in the current user reactions for parent comments and child comments
        resultData.forEach((parentComment) => {
            parentComment.currentUserReaction =
                currentUserParentCommentReactions[parentComment.id];
            parentComment.latestChildComments.forEach((childComment) => {
                childComment.currentUserReaction =
                    currentUserChildCommentReactions[childComment.id];
            });
        });

        return resultData;
    }

    private getLatestChildComments(
        ctx: RequestContext,
        parentCommentId: string,
        streamData: any,
    ): ChildCommentDto {
        this.logger.log(ctx, `${this.getLatestChildComments.name} was called`);

        return {
            id: streamData.data.commentId,
            content: streamData.data.content,
            status: streamData.data.status,
            createdDate: streamData.data.time,
            createdBy: {
                ...streamData.user.data,
            },
            edited: streamData.data.edited || false,
            parentId: parentCommentId,
            currentUserReaction: null,
            numberOfReactions:
                streamData?.children_counts?.POST_COMMENT_REACTION || 0,
        } as ChildCommentDto;
    }

    private async hydrateCurrentUserReactions(
        ctx: RequestContext,
        commentIds: Array<string>,
    ): Promise<Set<{ commentId: string; reactionType: ReactionType | null }>> {
        this.logger.log(
            ctx,
            `${this.hydrateCurrentUserReactions.name} was called`,
        );

        if (commentIds.length === 0) {
            return new Set();
        }

        const reactions = await this.pg.manyOrNone(
            `SELECT *
             FROM comment_reaction
             WHERE created_by_id = $1
               AND comment_id IN ($2:csv)`,
            [ctx.user.id, commentIds],
        );

        if (!reactions) {
            return new Set();
        }

        const commentReactions = reactions.map((reaction) => {
            return {
                commentId: reaction.commentId,
                reactionType: reaction.reactionType,
            };
        });

        return new Set(commentReactions);
    }

    private async createParentComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
    ): Promise<PostComment> {
        this.logger.log(ctx, `${this.createParentComment.name} was called`);

        const comment = await this.prisma.postComment.create({
            data: {
                content: createPostCommentInput.content,
                postId: createPostCommentInput.postId,
                createdById: ctx.user.id,
                createdDate: new Date(),
                status: CommentStatus.ACTIVE,
            },
            include: {
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
                post: {
                    include: {
                        postedBy: true,
                    },
                },
            },
        });

        // Send notification to post owner
        const postOwnerId = await this.getPostOwnerId(
            ctx,
            createPostCommentInput.postId,
        );
        this.queueService.publishActivity(
            ctx,
            ActivityType.POST_COMMENT,
            comment,
            undefined,
            postOwnerId,
        );

        try {
            const notification =
                await this.notificationService.createNotification(ctx, {
                    type: NotificationType.POST_COMMENT,
                    sourceId: comment.id,
                    fromUserId: ctx.user.id,
                    toUserId: postOwnerId,
                    message: `${ctx.user.username} commented on your post`,
                });
            await this.syncPostParentComment(ctx, comment, notification.id);
        } catch (err) {
            this.logger.warn(
                ctx,
                `Error while sending comment: ${comment.id} to stream or saving to notification table: ${err}`,
            );
        }

        return comment;
    }

    async getPostOwnerId(ctx: RequestContext, postId: string): Promise<string> {
        const post = await this.prisma.post.findFirst({
            where: {
                id: postId,
            },
            include: {
                postedBy: true,
            },
        });

        return post.postedBy.id;
    }

    async syncPostParentComment(
        ctx: RequestContext,
        comment: any,
        notificationId: string,
    ) {
        await this.streamService
            .addPostComment({
                kind: 'POST_COMMENT',
                // The ID of the activity (post) the reaction refers to
                postActivityId: comment.post.activityId,
                data: {
                    sourceId: comment.id,
                    postOwnerId: comment.post.postedById,
                    commentingUserId: comment.createdById,
                    time: new Date().toISOString(),
                    commentId: comment.id,
                    reactionCount: 0,
                    postId: comment.postId,
                    content: comment.content,
                    status: comment.status,
                },
                reactionAddOptions: {
                    userId: comment.createdById,
                    targetFeedsExtraData: {
                        [`notification:${comment.post.postedById}`]: {
                            sourceId: comment.id,
                            type: 'POST_COMMENT',
                            from: ctx.user.id,
                            to: comment.post.postedById,
                            notificationId: notificationId,
                        },
                    },
                },
            })
            .then(async (res: ReactionAPIResponse) => {
                await this.prisma.postComment.update({
                    where: {
                        id: comment.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            });
    }
}
