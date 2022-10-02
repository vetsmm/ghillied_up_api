import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext } from '../../shared';
import { PostFeedAclService } from './post-feed-acl.service';
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

    async getGhilliePostFeed(
        ctx: RequestContext,
        ghillieId: string,
        page = 1,
        perPage = 25,
    ) {
        this.logger.log(ctx, `${this.getGhilliePostFeed.name} was called`);

        try {
            const activities = await this.streamService.getGhillieFeed(
                ghillieId,
                {
                    limit: perPage,
                    offset: (page - 1) * perPage,
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
