import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PostFeedService {
  constructor(
    readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly feedAclService: PostFeedAclService,
    private readonly streamService: GetStreamService,
  ) {
    this.logger.setContext(PostFeedService.name);
  }

  async updateFeed(ctx: RequestContext, body: FeedInputDto): Promise<void> {}

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
}
