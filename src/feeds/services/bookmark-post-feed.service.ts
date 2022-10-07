import { AppLogger, FeedInputDto, RequestContext } from '../../shared';
import { FlatActivity } from 'getstream';
import { plainToInstance } from 'class-transformer';
import { Inject, Injectable } from '@nestjs/common';
import { PostFeedAclService } from './post-feed-acl.service';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { BookmarkPostFeedDto } from '../dtos/bookmark-post-feed.dto';

@Injectable()
export class BookmarkPostFeedService {
    constructor(
        private readonly logger: AppLogger,
        private readonly feedAclService: PostFeedAclService,
        private readonly streamService: GetStreamService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(BookmarkPostFeedService.name);
    }

    async getUsersBookmarkedPostFeed(
        ctx: RequestContext,
        page = 1,
        perPage = 25,
    ) {
        this.logger.log(
            ctx,
            `${this.getUsersBookmarkedPostFeed.name} was called`,
        );

        try {
            const activities = await this.streamService.getBookmarkPostFeed(
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
                `${this.getUsersBookmarkedPostFeed.name} failed`,
                err,
            );
            return [];
        }
    }

    async hydratePosts(
        ctx: RequestContext,
        activities: FlatActivity[],
    ): Promise<BookmarkPostFeedDto[]> {
        this.logger.log(ctx, `${this.hydratePosts.name} was called`);

        if (activities.length === 0) {
            return [];
        }

        const ghillies = await this.pg.many(
            `SELECT * FROM "Ghillie" WHERE "id" IN ($1:csv)`,
            [activities.map((a: any) => a.data?.ghillieId)],
        );

        const users = await this.pg.many(
            `SELECT * FROM "User" WHERE "id" IN ($1:csv)`,
            [activities.map((a: any) => a.data?.postedById)],
        );

        const feedItems: FeedInputDto[] = activities.map((a: any) => {
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
            } as FeedInputDto;
        });

        // Add the ghillie to the feed and conver the ghillie to
        feedItems.forEach((item: any) => {
            const ghillie = ghillies.find((g) => g.id === item.ghillieId);
            item.ghillieName = ghillie?.name;
            item.ghillieImageUrl = ghillie?.imageUrl || null;
        });

        // Add the user to the feed
        feedItems.forEach((item: any) => {
            const postedBy = users.find((u: any) => u.id === item.postedById);
            item.ownerUsername = postedBy?.username;
            item.ownerBranch = postedBy?.branch;
            item.ownerServiceStatus = postedBy?.serviceStatus;
            item.ownerSlug = postedBy?.slug;
        });

        return plainToInstance(BookmarkPostFeedDto, feedItems);
    }
}
