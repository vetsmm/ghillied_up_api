import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext, FlagCommentInputDto } from '../../shared';

@Injectable()
export class FlagCommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
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

    await this.prisma.flagComment.create({
      data: {
        postCommentId: input.commentId,
        createdByUserId: ctx.user.id,
        details: input.details,
        category: input.flagCategory,
        createdDate: new Date(),
      },
    });

    return Promise.resolve();
  }
}
