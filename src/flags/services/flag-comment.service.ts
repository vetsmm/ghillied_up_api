import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext, FlagCommentInputDto } from '../../shared';
import { FlagFeedVerb } from '../../shared/feed/feed.types';
import { GetStreamService } from '../../shared/getsream/getstream.service';

@Injectable()
export class FlagCommentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
    ) {
        this.logger.setContext(FlagCommentService.name);
    }

    async flagComment(
        ctx: RequestContext,
        input: FlagCommentInputDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.flagComment.name} was called`);

        // Check if post exists
        const comment = await this.prisma.postComment.findUnique({
            where: {
                id: input.commentId,
            },
        });

        if (!comment) {
            return Promise.reject(
                new Error(`Comment with id ${input.commentId} does not exist.`),
            );
        }

        // Check if post is already flagged by user if not flag it
        const commentFlagged = await this.prisma.flagComment.findFirst({
            where: {
                postCommentId: input.commentId,
                createdByUserId: ctx.user.id,
            },
        });

        if (commentFlagged) {
            return Promise.reject(
                new Error(
                    `Comment with ID: ${comment.id} has already been flagged by you.`,
                ),
            );
        }

        const flag = await this.prisma.flagComment.create({
            data: {
                postCommentId: input.commentId,
                createdByUserId: ctx.user.id,
                details: input.details,
                category: input.flagCategory,
                createdDate: new Date(),
            },
        });

        this.streamService
            .addFlagActivity('flag_comment', {
                actor: ctx.user.id,
                verb: FlagFeedVerb.COMMENT,
                object: FlagFeedVerb.COMMENT,
                foreign_id: `flag_comment:${comment.id}`,
                time: new Date().toISOString(),
                targetId: comment.id,
                published: flag.createdDate.toISOString(),
                data: flag,
            })
            .then(async (res) => {
                this.logger.log(
                    ctx,
                    `Comment Flag Activity added to feed with ID: ${res.id}`,
                );
                await this.prisma.flagComment.update({
                    where: {
                        id: flag.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error adding Comment Flag Activity to feed: ${err}`,
                );
            });

        return Promise.resolve();
    }
}
