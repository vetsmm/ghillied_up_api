import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext, FlagGhillieInputDto } from '../../shared';

@Injectable()
export class FlagGhillieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(FlagGhillieService.name);
  }

  async flagGhillie(
    ctx: RequestContext,
    input: FlagGhillieInputDto,
  ): Promise<void> {
    this.logger.log(ctx, `${this.flagGhillie.name} was called`);

    // Check if ghillie exists
    const ghillie = await this.prisma.ghillie.findUnique({
      where: {
        id: input.ghillieId,
      },
    });

    if (!ghillie) {
      throw new Error(`Ghillie with id ${input.ghillieId} does not exist`);
    }

    // Check if ghillie is already flagged by user if not flag it
    const ghillieFlagged = await this.prisma.flagGhillie.findFirst({
      where: {
        ghillieId: input.ghillieId,
        createdByUserId: ctx.user.id,
      },
    });

    if (ghillieFlagged) {
      throw new Error(`Ghillie ${ghillie.name} is already flagged by you`);
    }

    await this.prisma.flagGhillie.create({
      data: {
        ghillieId: input.ghillieId,
        createdByUserId: ctx.user.id,
        details: input.details,
        category: input.flagCategory,
        createdDate: new Date(),
      },
    });
  }
}
