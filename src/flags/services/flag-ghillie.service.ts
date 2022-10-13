import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext, FlagGhillieInputDto } from '../../shared';
import { FlagFeedVerb } from '../../shared/feed/feed.types';
import { GetStreamService } from '../../shared/getsream/getstream.service';

@Injectable()
export class FlagGhillieService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
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
            throw new Error(
                `Ghillie with id ${input.ghillieId} does not exist`,
            );
        }

        // Check if ghillie is already flagged by user if not flag it
        const ghillieFlagged = await this.prisma.flagGhillie.findFirst({
            where: {
                ghillieId: input.ghillieId,
                createdByUserId: ctx.user.id,
            },
        });

        if (ghillieFlagged) {
            throw new Error(
                `Ghillie ${ghillie.name} is already flagged by you`,
            );
        }

        const flag = await this.prisma.flagGhillie.create({
            data: {
                ghillieId: input.ghillieId,
                createdByUserId: ctx.user.id,
                details: input.details,
                category: input.flagCategory,
                createdDate: new Date(),
            },
        });

        this.streamService
            .addFlagActivity('flag_ghillie', {
                actor: ctx.user.id,
                verb: FlagFeedVerb.GHILLIE,
                object: FlagFeedVerb.GHILLIE,
                foreign_id: `flag_ghillie:${ghillie.id}`,
                time: new Date().toISOString(),
                targetId: ghillie.id,
                published: flag.createdDate.toISOString(),
                data: flag,
            })
            .then(async (res) => {
                this.logger.log(
                    ctx,
                    `Ghillie Flag Activity added to feed with ID: ${res.id}`,
                );
                await this.prisma.flagGhillie.update({
                    where: {
                        id: flag.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error adding Ghillie Flag Activity to feed: ${err}`,
                );
            });
    }
}
