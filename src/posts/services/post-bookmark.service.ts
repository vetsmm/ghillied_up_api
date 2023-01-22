import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Action, Actor, AppLogger, RequestContext } from '../../shared';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { PostAclService } from './post-acl.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import cuid from 'cuid';
import { PostFeedVerb } from '../../shared/feed/feed.types';
import { PostBookmark } from '@prisma/client';

@Injectable()
export class PostBookmarkService {
    constructor(
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
        private readonly postAclService: PostAclService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(PostBookmarkService.name);
    }

    async bookmarkPost(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.bookmarkPost.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.postAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to bookmark this post',
            );
        }

        const post = await this.pg.oneOrNone(
            'SELECT * FROM "post" WHERE id = $1',
            [id],
        );

        if (!post) {
            this.logger.warn(ctx, `Post not found: ${id}`);
            throw new NotFoundException('Post not found');
        }

        try {
            // check if a bookmark already exists
            const bookmarkFound: PostBookmark = await this.pg.oneOrNone(
                'SELECT * FROM "post_bookmark" WHERE "user_id" = $1 AND "post_id" = $2',
                [actor.id, id],
            );

            if (bookmarkFound) {
                this.logger.warn(
                    ctx,
                    `Bookmark already exists for post: ${id}`,
                );
                return;
            }

            const bookmark: { id: string; createdDate: Date } =
                await this.pg.one(
                    `INSERT INTO "post_bookmark" (id, "user_id", "post_id", "created_date")
                     VALUES ($1, $2, $3, $4)
                     RETURNING id, "created_date"`,
                    [cuid(), actor.id, id, new Date()],
                );
            this.streamService
                .bookmarkPost({
                    actor: ctx.user.id,
                    verb: PostFeedVerb.BOOKMARK,
                    object: PostFeedVerb.BOOKMARK,
                    foreign_id: `user_post_bookmark:${bookmark.id}`,
                    time: new Date().toISOString(),
                    targetId: bookmark.id,
                    published: bookmark.createdDate.toISOString(),
                    data: {
                        id: bookmark.id,
                        createdDate: bookmark.createdDate,
                        content: post.content,
                        ghillieId: post.ghillieId,
                        postedById: post.postedById,
                        status: post.status,
                        postId: post.id,
                        title: post.title,
                    },
                })
                .then(async (res) => {
                    await this.pg.any(
                        `UPDATE "post_bookmark"
                         SET "activity_id" = $1
                         WHERE id = $2`,
                        [res.id, bookmark.id],
                    );

                    this.logger.log(
                        ctx,
                        `Bookmark Activity for Post: ${id} added to Stream with AcitivityId: ${res.id}`,
                    );
                })
                .catch(async (err) => {
                    this.logger.error(
                        ctx,
                        `Error bookmarking post: ${id} with stream, rolling back bookmark: ${err}`,
                    );

                    await this.pg.any(
                        `DELETE
                         FROM "post_bookmark"
                         WHERE id = $1`,
                        [bookmark.id],
                    );
                });
        } catch (error) {
            this.logger.error(ctx, `Error bookmarking post ${id}: ${error}`);
            throw new Error('Could not bookmark post');
        }
    }

    async unbookmarkPost(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.unbookmarkPost.name} was called`);

        const bookmark: PostBookmark = await this.pg.oneOrNone(
            `SELECT *
             FROM "post_bookmark"
             WHERE "user_id" = $1
               AND "post_id" = $2`,
            [ctx.user.id, id],
        );

        if (!bookmark) {
            this.logger.warn(ctx, `Bookmark not found for post: ${id}`);
            return;
        }

        this.streamService
            .unbookmarkPost(ctx.user.id, bookmark.activityId)
            .then(async () => {
                this.logger.log(
                    ctx,
                    `Unbookmarked Post: ${id} from Stream with activityId: ${bookmark.activityId}`,
                );

                this.pg
                    .any(
                        `DELETE
                     FROM "post_bookmark"
                     WHERE "user_id" = $1
                       AND "post_id" = $2`,
                        [ctx.user.id, id],
                    )
                    .catch((err) => {
                        this.logger.error(
                            ctx,
                            `Error deleting bookmark for Post: ${id} from database. ${err}`,
                        );
                    });
            })
            .catch(async (err) => {
                this.logger.error(
                    ctx,
                    `Error unbookmarking post: ${id} with stream. ${err}`,
                );
            });
    }
}
