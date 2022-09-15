import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AppLogger,
  PageInfo,
  parsePaginationArgs,
  RequestContext,
  PostReactionSubsetDto,
  PostReactionDetailsDto,
  PostReactionInputDto,
  PostDetailDto,
} from '../../shared';
import { PostAclService } from './post-acl.service';
import { MemberStatus, PostReaction } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PostService } from './post.service';
import {QueueService} from "../../queue/services/queue.service";
import {ActivityType} from "../../shared/queue/activity-type";

@Injectable()
export class PostReactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly postAclService: PostAclService,
    private readonly postService: PostService,
    private readonly queueService: QueueService,
  ) {
    this.logger.setContext(PostReactionService.name);
  }

  async reactToPost(
    ctx: RequestContext,
    reactionInput: PostReactionInputDto,
  ): Promise<PostDetailDto> {
    this.logger.log(ctx, `${this.reactToPost.name} was called`);

    // get the post
    const post = await this.prisma.post.findUnique({
      where: {
        id: reactionInput.postId,
      },
    });

    if (!post) {
      throw new Error(
        `The post with id ${reactionInput.postId} does not exist. Please enter the correct post id.`,
      );
    }

    // check if the user has access to the ghillie for the post
    const member = await this.prisma.ghillieMembers.findFirst({
      where: {
        ghillieId: post.ghillieId,
        userId: ctx.user.id,
        memberStatus: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new Error(`You do not have access to to react to this post.`);
    }

    // Update the post with the new reaction if exists, if not create, if reaction is null, then delete
    if (reactionInput.reactionType) {
      const reaction = await this.prisma.postReaction.upsert({
        where: {
          createdById_postId: {
            postId: reactionInput.postId,
            createdById: ctx.user.id,
          },
        },
        create: {
          postId: reactionInput.postId,
          createdById: ctx.user.id,
          reactionType: reactionInput.reactionType,
        },
        update: {
          reactionType: reactionInput.reactionType,
        },
      });
      this.queueService.publishActivity<PostReaction>(
          ctx,
          ActivityType.POST_REACTION,
          reaction
      );
    } else {
      // check if the user has reacted to the post
      const reaction = await this.prisma.postReaction.findFirst({
        where: {
          postId: reactionInput.postId,
          createdById: ctx.user.id,
        },
      });

      if (!reaction) {
        return;
      }

      await this.prisma.postReaction.delete({
        where: {
          createdById_postId: {
            postId: reactionInput.postId,
            createdById: ctx.user.id,
          },
        },
      });
    }

    return this.postService.getPostById(ctx, reactionInput.postId);
  }

  async getAllPostReactions(
    ctx: RequestContext,
    postId: string,
    cursor?: string,
    take = 25,
  ): Promise<{
    reactions: PostReactionDetailsDto[];
    pageInfo: PageInfo;
  }> {
    this.logger.log(ctx, `${this.getAllPostReactions.name} was called`);

    const { findManyArgs, toConnection } = parsePaginationArgs({
      first: take - 1,
      after: cursor ? cursor : undefined,
    });

    // get the reactions for the post
    const reactions = await this.prisma.postReaction.findMany({
      ...findManyArgs,
      where: {
        postId: postId,
      },
      include: {
        post: true,
      },
    });

    if (reactions.length === 0) {
      return {
        reactions: [] as Array<PostReactionDetailsDto>,
        pageInfo: toConnection(reactions).pageInfo,
      };
    }

    return {
      reactions: plainToInstance(PostReactionDetailsDto, reactions, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      pageInfo: toConnection(reactions).pageInfo,
    };
  }

  async getCurrentUserReactions(
    ctx: RequestContext,
    postId: string,
    cursor?: string,
    take = 25,
  ): Promise<{
    reactions: PostReactionDetailsDto[];
    pageInfo: PageInfo;
  }> {
    this.logger.log(ctx, `${this.getCurrentUserReactions.name} was called`);

    const { findManyArgs, toConnection } = parsePaginationArgs({
      first: take - 1,
      after: cursor ? cursor : undefined,
    });

    // get the reactions for the post
    const reactions = await this.prisma.postReaction.findMany({
      ...findManyArgs,
      where: {
        postId: postId,
        createdById: ctx.user.id,
      },
      include: {
        post: {
          include: {
            ghillie: true,
            postedBy: true,
          },
        },
      },
    });

    if (reactions.length === 0) {
      return {
        reactions: [] as Array<PostReactionDetailsDto>,
        pageInfo: toConnection(reactions).pageInfo,
      };
    }

    return {
      reactions: plainToInstance(PostReactionDetailsDto, reactions, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      pageInfo: toConnection(reactions).pageInfo,
    };
  }

  async getPostReactionsCount(
    ctx: RequestContext,
    postId: string,
  ): Promise<PostReactionSubsetDto> {
    this.logger.log(ctx, `${this.getCurrentUserReactions.name} was called`);

    // get the post
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        ghillie: true,
        postedBy: true,
      },
    });

    if (!post) {
      throw new Error(
        `The post with id ${postId} does not exist. Please enter the correct post id.`,
      );
    }

    // Get the counts for all the different reactionTypes for a post
    const reactionCounts = await this.prisma.postReaction.groupBy({
      by: ['reactionType'],
      where: {
        postId: postId,
      },
      _count: true,
    });

    // get total count of reactions for the post based on the aggregation
    const totalReactions = reactionCounts
      .map((reaction) => reaction._count)
      .reduce((a, b) => a + b, 0);
    const reactions = reactionCounts.map((reaction) => {
      return { [reaction.reactionType]: reaction._count };
    });

    return {
      totalReactions,
      reactions,
      postId: post.id,
      post: plainToInstance(PostDetailDto, post, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    } as unknown as PostReactionSubsetDto;
  }
}
