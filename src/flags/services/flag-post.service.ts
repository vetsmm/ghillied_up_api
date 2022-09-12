import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext, FlagPostInputDto } from '../../shared';

@Injectable()
export class FlagPostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(FlagPostService.name);
  }

  async flagPost(ctx: RequestContext, input: FlagPostInputDto): Promise<void> {
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
        new Error(`Post with ID: ${post.id} has already been flagged by you.`),
      );
    }

    await this.prisma.flagPost.create({
      data: {
        postId: input.postId,
        createdByUserId: ctx.user.id,
        details: input.details,
        category: input.flagCategory,
        createdDate: new Date(),
      },
    });

    return Promise.resolve();
  }
}
