import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext, FlagPostInputDto } from '../../shared';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { FlagFeedVerb } from '../../shared/feed/feed.types';

@Injectable()
export class FlagPostService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
    ) {
        this.logger.setContext(FlagPostService.name);
    }

    async flagPost(
        ctx: RequestContext,
        input: FlagPostInputDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.flagPost.name} was called`);

        // Check if post exists
        const post = await this.prisma.post.findUnique({
            where: {
                id: input.postId,
            },
        });

        if (!post) {
            return Promise.reject(
                new Error(`Post with id ${input.postId} does not exist.`),
            );
        }

        // Check if post is already flagged by user if not flag it
        const postFlagged = await this.prisma.flagPost.findFirst({
            where: {
                postId: input.postId,
                createdByUserId: ctx.user.id,
            },
        });

        if (postFlagged) {
            return Promise.reject(
                new Error(
                    `Post with ID: ${post.id} has already been flagged by you.`,
                ),
            );
        }

        const flag = await this.prisma.flagPost.create({
            data: {
                postId: input.postId,
                createdByUserId: ctx.user.id,
                details: input.details,
                category: input.flagCategory,
                createdDate: new Date(),
            },
        });

        this.streamService
            .addFlagActivity('flag_post', {
                actor: ctx.user.id,
                verb: FlagFeedVerb.POST,
                object: FlagFeedVerb.POST,
                foreign_id: `flag_post:${post.id}`,
                time: new Date().toISOString(),
                targetId: post.id,
                published: flag.createdDate.toISOString(),
                data: flag,
            })
            .then(async (res) => {
                this.logger.log(
                    ctx,
                    `Post Flag Activity added to feed with ID: ${res.id}`,
                );
                await this.prisma.flagPost.update({
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
                    `Error adding Post Flag Activity to feed: ${err}`,
                );
            });

        return Promise.resolve();
    }
}
