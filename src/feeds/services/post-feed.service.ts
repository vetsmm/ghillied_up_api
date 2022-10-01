import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    AppLogger,
    FeedInputDto,
    PageInfo,
    parsePaginationArgs,
    RequestContext,
} from '../../shared';
import { PostFeedAclService } from './post-feed-acl.service';
import { PostListingDto } from '../../posts/dtos/post-listing.dto';
import { plainToInstance } from 'class-transformer';
import { MemberStatus } from '@prisma/client';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { FlatActivity } from 'getstream';
import { PostFeedDto } from '../dtos/post-feed.dto';

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

    async getFeed(
        ctx: RequestContext,
        body: FeedInputDto,
    ): Promise<{
        posts: Array<PostListingDto>;
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getFeed.name} was called`);

        const where = this.generatePrismaWhereQuery(body.filters);

        const { findManyArgs, toConnection } = parsePaginationArgs({
            first: body.take - 1,
            after: body.cursor ? body.cursor : undefined,
        });

        console.log('Executing QUery');
        const posts = await this.prisma.post.findMany({
            ...findManyArgs,
            ...where,
            orderBy: {
                createdDate: body.orderBy,
            },
            include: {
                tags: true,
                postedBy: true,
                // only posts in ghillies user is a member of
                ghillie: {
                    include: {
                        members: {
                            where: {
                                userId: ctx.user.id,
                                memberStatus: MemberStatus.ACTIVE,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        postComments: true,
                        postReaction: true,
                    },
                },
                postReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        if (posts.length === 0) {
            return {
                posts: [] as Array<PostListingDto>,
                pageInfo: toConnection(posts).pageInfo,
            };
        }

        return {
            posts: plainToInstance(PostListingDto, posts, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            pageInfo: toConnection(posts).pageInfo,
        };
    }

    private generatePrismaWhereQuery(query: object): object | null {
        // Take all the keys in the object, and generate a where clause with AND for each key
        // e.g. { id: { equals: 1 } } => { where: { id: { equals: 1 } } }
        if (query === undefined || Object.keys(query).length === 0) {
            return null;
        }
        const where = { AND: [] };
        Object.keys(query).forEach((key) => {
            where.AND.push({ [key]: query[key] });
        });

        return { where };
    }

    async getUserFeed(
        ctx: RequestContext,
        page = 1,
        perPage = 25,
    ): Promise<PostFeedDto[]> {
        this.logger.log(ctx, `${this.getUserFeed.name} was called`);

        const activities = await this.streamService.getFeed(ctx.user.id, {
            limit: perPage,
            offset: (page - 1) * perPage,
        });

        return this.hydratePosts(
            ctx,
            activities.results as Array<FlatActivity>,
        );
    }

    // Enriches the feed with the post data
    async hydratePosts(
        ctx: RequestContext,
        activities: FlatActivity[],
    ): Promise<PostFeedDto[]> {
        this.logger.log(ctx, `${this.hydratePosts.name} was called`);

        return await this.pg.many(
            `SELECT "p"."id",
                    "p"."uid",
                    "p"."title",
                    "p"."content",
                    "p"."status",
                    "p"."ghillieId",
                    "p"."postedById",
                    "p"."createdDate",
                    "p"."updatedDate",
                    "p"."edited",
                    "p"."activityId",
                    "u"."username"                                             as "ownerUsername",
                    "u"."branch"                                               as "ownerBranch",
                    "u"."serviceStatus"                                        as "ownerServiceStatus",
                    "u".slug                                                   as "ownerSlug",
                    "aggr_selection_0_PostComment"."_aggr_count_postComments"  as "postCommentsCount",
                    "aggr_selection_1_PostReaction"."_aggr_count_postReaction" as "postReactionsCount",
                    "pr".id                                                    as "currentUserReactionId",
                    "pr"."reactionType"                                        as "currentUserReactionType",
                    "g"."name"                                                 as "ghillieName",
                    "g"."imageUrl"                                             as "ghillieImageUrl",
                    "g".id                                                     as "ghillieId"
             FROM "Post" as p
                      LEFT JOIN (SELECT "PostComment"."postId", COUNT(*) AS "_aggr_count_postComments"
                                 FROM "PostComment"
                                 WHERE "PostComment"."postId" in ('cl8o2eqvr0025x50yc034vler')
                                 GROUP BY "PostComment"."postId") AS "aggr_selection_0_PostComment"
                                ON ("p"."id" = "aggr_selection_0_PostComment"."postId")
                      LEFT JOIN (SELECT "PostReaction"."postId", COUNT(*) AS "_aggr_count_postReaction"
                                 FROM "PostReaction"
                                 WHERE "PostReaction"."postId" in ('cl8o2eqvr0025x50yc034vler')
                                 GROUP BY "PostReaction"."postId") AS "aggr_selection_1_PostReaction"
                                ON ("p"."id" = "aggr_selection_1_PostReaction"."postId")
                      LEFT JOIN "User" as u ON "p"."postedById" = "u"."id"
                      LEFT JOIN "PostReaction" as pr ON "p"."id" = "pr"."postId" AND "pr"."createdById" = $1
                      LEFT JOIN "Ghillie" as g ON "p"."ghillieId" = "g"."id"
             WHERE "p".id in ($2:csv)`,
            [
                ctx.user.id,
                activities.map((a) => {
                    // strip "post:" from the activity id
                    return a.foreign_id.split(':')[1];
                }),
            ],
        );
    }
}
