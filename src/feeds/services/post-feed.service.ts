import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext } from '../../shared';
import { PostFeedAclService } from './post-feed-acl.service';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { FlatActivity } from 'getstream';
import { PostFeedDto } from '../dtos/post-feed.dto';
import { plainToInstance } from 'class-transformer';
import { GhillieStatus } from '@prisma/client';

@Injectable()
export class PostFeedService {
    constructor(
        readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly feedAclService: PostFeedAclService,
        private readonly streamService: GetStreamService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(PostFeedService.name);
    }

    async getHashtagPostFeed(
        ctx: RequestContext,
        tagName: string,
        page: number,
        take: number,
    ) {
        this.logger.log(ctx, `${this.getHashtagPostFeed.name} was called`);

        try {
            const activities = await this.streamService.getHashtagFeed(
                tagName,
                {
                    limit: take,
                    offset: (page - 1) * take,
                    withReactionCounts: true,
                    withOwnReactions: true,
                },
            );

            return this.hydratePosts(
                ctx,
                activities.results as Array<FlatActivity>,
            );
        } catch (err) {
            this.logger.error(
                ctx,
                `${this.getHashtagPostFeed.name} failed`,
                err,
            );
            return [];
        }
    }

    async getUserFeed(
        ctx: RequestContext,
        page = 1,
        perPage = 25,
    ): Promise<PostFeedDto[]> {
        this.logger.log(ctx, `${this.getUserFeed.name} was called`);

        try {
            const activities = await this.streamService.getFeed(ctx.user.id, {
                limit: perPage,
                offset: (page - 1) * perPage,
                withReactionCounts: true,
                withOwnReactions: true,
            });

            return this.hydratePosts(
                ctx,
                activities.results as Array<FlatActivity>,
            );
        } catch (err) {
            this.logger.error(ctx, `${this.getUserFeed.name} failed`, err);
            return [];
        }
    }

    async getUsersPersonalFeed(
        ctx: RequestContext,
        page = 1,
        perPage = 25,
    ): Promise<PostFeedDto[]> {
        this.logger.log(ctx, `${this.getUsersPersonalFeed.name} was called`);

        try {
            const activities = await this.streamService.getUsersPersonalFeed(
                ctx.user.id,
                {
                    limit: perPage,
                    offset: (page - 1) * perPage,
                    withReactionCounts: true,
                    withOwnReactions: true,
                },
            );

            return this.hydratePosts(
                ctx,
                activities.results as Array<FlatActivity>,
            );
        } catch (err) {
            this.logger.error(
                ctx,
                `${this.getUsersPersonalFeed.name} failed`,
                err,
            );
            return [];
        }
    }

    async getGhilliePostFeed(
        ctx: RequestContext,
        ghillieId: string,
        page = 1,
        perPage = 25,
    ) {
        this.logger.log(ctx, `${this.getGhilliePostFeed.name} was called`);

        const ghillie = await this.prisma.ghillie.findUnique({
            where: { id: ghillieId },
        });

        if (!ghillie) {
            throw new Error('Ghillie not found');
        }

        if (ghillie.status !== GhillieStatus.ACTIVE) {
            throw new Error('Ghillie is not active');
        }

        try {
            const activities = await this.streamService.getGhillieFeed(
                ghillieId,
                {
                    limit: perPage,
                    offset: (page - 1) * perPage,
                    withReactionCounts: true,
                    withOwnReactions: true,
                },
            );

            return this.hydratePosts(
                ctx,
                activities.results as Array<FlatActivity>,
            );
        } catch (err) {
            this.logger.error(
                ctx,
                `${this.getGhilliePostFeed.name} failed`,
                err,
            );
            return [];
        }
    }

    // Enriches the feed with the post data
    async hydratePosts(
        ctx: RequestContext,
        activities: FlatActivity[],
    ): Promise<PostFeedDto[]> {
        this.logger.log(ctx, `${this.hydratePosts.name} was called`);

        if (activities.length === 0) {
            return [];
        }

        const ghillies = await this.pg.many(
            `SELECT *
             FROM "ghillie"
             WHERE "id" IN ($1:csv)`,
            [activities.map((a: any) => a.data?.ghillieId)],
        );

        const users = await this.pg.many(
            `SELECT *
             FROM "user"
             WHERE "id" IN ($1:csv)`,
            [activities.map((a: any) => a.data?.postedById)],
        );

        const feedItems: PostFeedDto[] = activities.map((a: any) => {
            const currentUserReaction =
                a.own_reactions.POST_REACTION?.find(
                    (r) => r.user_id === ctx.user.id,
                ) || null;
            const totalReactions = a.reaction_counts.POST_REACTION || 0;
            const totalComments = a.reaction_counts.POST_COMMENT || 0;
            return {
                ...a.data,
                currentUserReactionId:
                    currentUserReaction?.data?.reactionId || null,
                currentUserReactionType:
                    currentUserReaction?.data?.reactionType || null,
                postCommentsCount: totalComments,
                postReactionsCount: totalReactions,
            } as PostFeedDto;
        });

        feedItems.forEach((item: PostFeedDto) => {
            // Hydrate in the ghillie
            const ghillie = ghillies.find((g) => g.id === item.ghillieId);
            item.ghillieName = ghillie?.name;
            item.ghillieImageUrl = ghillie?.imageUrl || null;

            // Hydrate in the user
            const postedBy = users.find((u: any) => u.id === item.postedById);
            item.ownerUsername = postedBy?.username;
            item.ownerBranch = postedBy?.branch;
            item.ownerServiceStatus = postedBy?.serviceStatus;
            item.ownerSlug = postedBy?.slug;
        });

        return plainToInstance(PostFeedDto, feedItems);
    }
}
