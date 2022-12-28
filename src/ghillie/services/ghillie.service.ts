import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    Action,
    Actor,
    AppLogger,
    GhillieSearchCriteria,
    PageInfo,
    parsePaginationArgs,
    RequestContext,
} from '../../shared';
import {
    Ghillie,
    GhillieRole,
    GhillieStatus,
    MemberStatus,
    PublicFile,
    Topic,
} from '@prisma/client';
import { CreateGhillieInputDto } from '../dtos/ghillie/create-ghillie-input.dto';
import slugify from 'slugify';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GhillieDetailDto } from '../dtos/ghillie/ghillie-detail.dto';
import { GhillieAclService } from './ghillie-acl.service';
import { UpdateGhillieDto } from '../dtos/ghillie/update-ghillie.dto';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { GhillieAssetsService } from '../../files/services/ghillie-assets.service';
import { AssetTypes } from '../../files/dtos/asset.types';
import { CombinedGhilliesDto } from '../dtos/ghillie/combined-ghillies.dto';

@Injectable()
export class GhillieService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly ghillieAclService: GhillieAclService,
        private readonly streamService: GetStreamService,
        private readonly ghillieAssetsService: GhillieAssetsService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(GhillieService.name);
    }

    async createGhillie(
        ctx: RequestContext,
        createGhillieDto: CreateGhillieInputDto,
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.createGhillie.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Create);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to create a ghillie',
            );
        }

        let publicFile: PublicFile;

        try {
            const ghillie = await this.prisma.$transaction(async (prisma) => {
                let topics = [] as Array<Topic>;
                if (createGhillieDto.topicNames) {
                    topics = await Promise.all(
                        createGhillieDto?.topicNames?.map(async (topicName) => {
                            return await prisma.topic.upsert({
                                where: {
                                    name: topicName,
                                },
                                update: {},
                                create: {
                                    name: topicName,
                                    slug: slugify(topicName, {
                                        replacement: '-',
                                        lower: true,
                                        strict: true,
                                        trim: true,
                                    }),
                                    createdByUserId: ctx.user.id,
                                },
                            });
                        }),
                    );
                }

                const ghillie: Ghillie = await prisma.ghillie.create({
                    data: {
                        name: createGhillieDto.name,
                        slug: slugify(createGhillieDto.name, {
                            replacement: '-',
                            lower: true,
                            strict: true,
                            trim: true,
                        }),
                        about: createGhillieDto.about,
                        adminInviteOnly: createGhillieDto.adminInviteOnly,
                        isPrivate: createGhillieDto.isPrivate,
                        category: createGhillieDto.category,
                        createdByUserId: ctx.user.id,
                        readOnly: createGhillieDto?.readOnly ?? false,
                        topics: {
                            connect: topics.map((topic) => ({
                                id: topic.id,
                            })),
                        },
                    },
                    include: {
                        publicImage: true,
                        topics: true,
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                        members: {
                            where: {
                                userId: ctx.user.id,
                            },
                        },
                    },
                });

                // Create a ghillie member for the owner
                await prisma.ghillieMembers.create({
                    data: {
                        ghillieId: ghillie.id,
                        userId: ctx.user.id,
                        role: GhillieRole.OWNER,
                        joinDate: new Date(),
                        memberStatus: MemberStatus.ACTIVE,
                    },
                });

                return ghillie;
            });

            this.streamService
                .followGhillie(ghillie.id, ctx.user.id)
                .then(() => {
                    this.logger.log(
                        ctx,
                        `Followed ghillie ${ghillie.id} for user ${ctx.user.id}`,
                    );
                })
                .catch((err) => {
                    this.logger.error(
                        ctx,
                        `Failed to follow ghillie ${ghillie.id} for user ${ctx.user.id}: ${err}`,
                    );
                });

            return plainToInstance(GhillieDetailDto, ghillie, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });
        } catch (err) {
            this.logger.error(ctx, `${this.createGhillie.name} failed: ${err}`);

            if (publicFile) {
                await this.ghillieAssetsService.deleteGhillieAssetById(
                    ctx,
                    publicFile,
                );
            }
            throw new InternalServerErrorException();
        }
    }

    async getGhillie(
        ctx: RequestContext,
        id: string,
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.getGhillie.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view a ghillie',
            );
        }

        const ghillie = await this.prisma.ghillie.findFirst({
            where: {
                id: id,
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found or is not active');
        }

        const totalMembers = await this.prisma.ghillieMembers.count({
            where: {
                ghillieId: id,
            },
        });

        const ghillieDetail = plainToInstance(GhillieDetailDto, ghillie, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });

        ghillieDetail.totalMembers = totalMembers;

        return ghillieDetail;
    }

    async getGhillies(
        ctx: RequestContext,
        query: GhillieSearchCriteria,
    ): Promise<{
        ghillies: GhillieDetailDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getGhillies.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view Ghillies',
            );
        }

        const where = { AND: [] };
        if (query.name) {
            where.AND.push({
                name: { contains: query.name, mode: 'insensitive' },
            });
        }
        if (query.readonly) {
            where.AND.push({ readOnly: query.readonly });
        }
        if (query.topicIds) {
            where.AND.push({
                topics: {
                    some: {
                        id: {
                            in: query.topicIds,
                        },
                    },
                },
            });
        }

        if (query.category) {
            where.AND.push({
                category: query.category,
            });
        }

        const { findManyArgs, toConnection, toResponse } = parsePaginationArgs({
            first: query.take - 1,
            after: query.cursor ? query.cursor : undefined,
        });

        try {
            const ghillies = await this.prisma.ghillie.findMany({
                ...findManyArgs,
                where: {
                    ...where,
                    status: GhillieStatus.ACTIVE,
                    isPrivate: false,
                },
                include: {
                    topics: true,
                    _count: {
                        select: {
                            members: true,
                        },
                    },
                    members: {
                        where: {
                            userId: ctx.user.id,
                        },
                    },
                },
            });

            if (ghillies.length === 0) {
                return {
                    ghillies: [],
                    pageInfo: toConnection(ghillies).pageInfo,
                };
            }

            const convertedGhillies = plainToInstance(
                GhillieDetailDto,
                toResponse(ghillies),
                {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                },
            );

            return {
                ghillies: convertedGhillies,
                pageInfo: toConnection(ghillies).pageInfo,
            };
        } catch (err) {
            this.logger.error(ctx, err);
            throw new InternalServerErrorException(err);
        }
    }

    async updateGhillie(
        ctx: RequestContext,
        id: string,
        updateGhillieDto: UpdateGhillieDto,
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.updateGhillie.name} was called`);

        const ghillieMember = await this.pg.oneOrNone(
            'SELECT * FROM ghillie_members WHERE ghillie_id = $1 AND user_id = $2',
            [id, ctx.user.id],
        );

        if (!ghillieMember) {
            throw new UnauthorizedException(
                'You are not allowed to update this ghillie',
            );
        }

        const isAllowed =
            ghillieMember.role === GhillieRole.OWNER ||
            ctx.user.authorities.includes('ROLE_ADMIN');
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to update this ghillie',
            );
        }

        const ghillie = await this.pg.oneOrNone(
            `SELECT *
             FROM ghillie
             WHERE ghillie.id = $1`,
            [id],
        );

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        if (updateGhillieDto.readOnly !== undefined) {
            ghillie.readOnly = updateGhillieDto.readOnly;
        }

        if (updateGhillieDto.name !== undefined) {
            ghillie.name = updateGhillieDto.name;
            ghillie.slug = slugify(updateGhillieDto.name, {
                replacement: '-',
                lower: true,
                strict: true,
                trim: true,
            });
        }

        if (updateGhillieDto.about !== undefined) {
            ghillie.about = updateGhillieDto.about;
        }

        if (updateGhillieDto.isPrivate !== undefined) {
            ghillie.isPrivate = updateGhillieDto.isPrivate;
        }

        if (updateGhillieDto.adminInviteOnly !== undefined) {
            ghillie.adminInviteOnly = updateGhillieDto.adminInviteOnly;
        }

        if (updateGhillieDto.category !== undefined) {
            ghillie.category = updateGhillieDto.category;
        }

        const updatedGhillie = await this.prisma.ghillie.update({
            where: { id: id },
            data: {
                ...ghillie,
                publicImageId: ghillie?.publicImageId,
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(GhillieDetailDto, updatedGhillie, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteGhillie(ctx: RequestContext, id: string): Promise<void> {
        this.logger.log(ctx, `${this.deleteGhillie.name} was called`);

        // get the ghillie member
        const ghillieUser = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ ghillieId: id }, { userId: ctx.user.id }],
            },
        });

        if (!ghillieUser) {
            throw new UnauthorizedException(
                'You are not allowed to delete this ghillie',
            );
        }

        const isAllowed =
            ghillieUser.role === GhillieRole.OWNER ||
            ctx.user.authorities.includes('ROLE_ADMIN');
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to delete this ghillie',
            );
        }

        try {
            const publicFile: PublicFile = await this.pg.one(
                'SELECT * from public_file where public_file.id = (SELECT ghillie.public_image_id from ghillie where ghillie.id = $1)',
                [id],
            );
            await this.ghillieAssetsService.deleteGhillieAssetById(
                ctx,
                publicFile,
            );
        } catch (err) {
            this.logger.warn(ctx, `Error deleting ghillie logo: ${err}`);
        }

        await this.prisma.ghillie.update({
            where: { id: id },
            data: {
                status: GhillieStatus.ARCHIVED,
            },
        });
    }

    async joinGhillie(ctx: RequestContext, id: string): Promise<void> {
        this.logger.log(ctx, `${this.joinGhillie.name} was called`);

        const ghillie: Ghillie = await this.pg.oneOrNone(
            `SELECT *
             FROM ghillie
             WHERE id = $1`,
            [id],
        );

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }
        if (ghillie.status !== GhillieStatus.ACTIVE) {
            throw new BadRequestException(
                'Ghillie is not join-able at this time',
            );
        }

        if (ghillie.isPrivate) {
            throw new BadRequestException(
                'Ghillie is private and requires an invite',
            );
        }

        await this.createGhillieMember(ctx, ghillie.id);
    }

    async joinGhillieWithInviteCode(ctx: RequestContext, inviteCode: string) {
        this.logger.log(ctx, `${this.joinGhillie.name} was called`);

        const ghillie: Ghillie = await this.pg.oneOrNone(
            `SELECT *
             FROM ghillie
             WHERE invite_code = $1`,
            [inviteCode],
        );

        if (!ghillie) {
            throw new NotFoundException(
                'No Ghillie found with that invite code',
            );
        }
        if (ghillie.status !== GhillieStatus.ACTIVE) {
            throw new BadRequestException(
                'Ghillie is not join-able at this time',
            );
        }

        await this.createGhillieMember(ctx, ghillie.id);
    }

    async createGhillieMember(ctx: RequestContext, ghillieId: string) {
        const ghillieMember = await this.prisma.ghillieMembers.upsert({
            where: {
                userId_ghillieId: {
                    userId: ctx.user.id,
                    ghillieId: ghillieId,
                },
            },
            update: {},
            create: {
                ghillieId: ghillieId,
                userId: ctx.user.id,
                joinDate: new Date(),
                memberStatus: MemberStatus.ACTIVE,
                role: GhillieRole.MEMBER,
            },
        });

        if (ghillieMember.memberStatus === MemberStatus.SUSPENDED) {
            throw new UnauthorizedException(
                'You have been suspended from this ghillie',
            );
        }
        if (ghillieMember.memberStatus === MemberStatus.BANNED) {
            throw new UnauthorizedException(
                'You have been banned from this ghillie',
            );
        }

        await this.streamService.followGhillie(ghillieId, ctx.user.id);
    }

    async leaveGhillie(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.leaveGhillie.name} was called`);

        const ghillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });

        if (!ghillieMember) {
            throw new NotFoundException('You are not a member of this ghillie');
        }

        if (ghillieMember.memberStatus === MemberStatus.SUSPENDED) {
            throw new UnauthorizedException(
                'You have been suspended from this ghillie',
            );
        }
        if (ghillieMember.memberStatus === MemberStatus.BANNED) {
            throw new UnauthorizedException(
                'You have been banned from this ghillie',
            );
        }
        if (ghillieMember.role === GhillieRole.OWNER) {
            throw new BadRequestException(
                'You cannot leave a Ghillie you own. Please transfer ownership first.',
            );
        }

        // Delete the user from all ghillies
        await this.prisma.ghillieMembers.delete({
            where: {
                userId_ghillieId: {
                    userId: ctx.user.id,
                    ghillieId: id,
                },
            },
        });

        await this.streamService.unfollowGhillie(id, ctx.user.id);
    }

    async transferOwnership(
        ctx: RequestContext,
        id: string,
        userId: string,
    ): Promise<void> {
        // Get the user from transferOwnershipDto
        const transferToUser = await this.prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { activated: true }, // Must be an activated account
                ],
            },
        });

        if (!transferToUser) {
            throw new NotFoundException('Invalid User Id provided');
        }

        // Get the ghillie from id
        const ghillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is the owner the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieManage, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to transfer ownership of this ghillie",
            );
        }

        await this.prisma.$transaction(async (prisma) => {
            // Do the transfer to the new
            await prisma.ghillieMembers.upsert({
                where: {
                    userId_ghillieId: {
                        userId: userId,
                        ghillieId: id,
                    },
                },
                update: {
                    role: GhillieRole.OWNER,
                },
                create: {
                    ghillieId: id,
                    userId: userId,
                    joinDate: new Date(),
                    memberStatus: MemberStatus.ACTIVE,
                    role: GhillieRole.OWNER,
                },
            });

            // Make existing owner a member
            await prisma.ghillieMembers.update({
                where: {
                    userId_ghillieId: {
                        userId: ctx.user.id,
                        ghillieId: id,
                    },
                },
                data: {
                    role: GhillieRole.MEMBER,
                },
            });
        });
    }

    async addModerator(ctx: RequestContext, id: string, userId: string) {
        // Get the user from transferOwnershipDto
        const newModeratorUser = await this.prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { activated: true }, // Must be an activated account
                ],
            },
        });

        if (!newModeratorUser) {
            throw new NotFoundException('Invalid User Id provided');
        }

        // Get the ghillie from id
        const ghillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is the owner the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieManage, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to add moderators to this ghillie",
            );
        }

        await this.prisma.ghillieMembers.upsert({
            where: {
                userId_ghillieId: {
                    userId: userId,
                    ghillieId: id,
                },
            },
            update: {
                role: GhillieRole.MODERATOR,
            },
            create: {
                ghillieId: id,
                userId: userId,
                joinDate: new Date(),
                memberStatus: MemberStatus.ACTIVE,
                role: GhillieRole.MODERATOR,
            },
        });
    }

    async removeModerator(ctx: RequestContext, id: string, userId: string) {
        // Get the user from transferOwnershipDto
        const removeModeratorUser = await this.prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { activated: true }, // Must be an activated account
                ],
            },
        });

        if (!removeModeratorUser) {
            throw new NotFoundException('Invalid User Id provided');
        }

        // Get the ghillie from id
        const ghillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is the owner the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieManage, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to add moderators to this ghillie",
            );
        }

        await this.prisma.ghillieMembers.update({
            where: {
                userId_ghillieId: {
                    userId: userId,
                    ghillieId: id,
                },
            },
            data: {
                role: GhillieRole.MEMBER,
            },
        });
    }

    async banUser(ctx: RequestContext, id: string, userId: string) {
        // Get the user from transferOwnershipDto
        const banUser = await this.prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { activated: true }, // Must be an activated account
                ],
            },
        });

        if (!banUser) {
            throw new NotFoundException('Invalid User Id provided');
        }

        // Get the ghillie from id
        const ghillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is a moderator or owner of the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieModerator, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to moderate users from this ghillie",
            );
        }

        await this.prisma.ghillieMembers.update({
            where: {
                userId_ghillieId: {
                    userId: userId,
                    ghillieId: id,
                },
            },
            data: {
                memberStatus: MemberStatus.BANNED,
            },
        });

        await this.streamService.unfollowGhillie(id, userId);
    }

    async unbanUser(ctx: RequestContext, id: string, userId: string) {
        // Get the user from transferOwnershipDto
        const unbanUser = await this.prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { activated: true }, // Must be an activated account
                ],
            },
        });

        if (!unbanUser) {
            throw new NotFoundException('Invalid User Id provided');
        }

        // Get the ghillie from id
        const ghillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is a moderator or owner of the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieModerator, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to moderate users from this ghillie",
            );
        }

        await this.prisma.ghillieMembers.update({
            where: {
                userId_ghillieId: {
                    userId: userId,
                    ghillieId: id,
                },
            },
            data: {
                memberStatus: MemberStatus.ACTIVE,
            },
        });

        await this.streamService.followGhillie(id, userId);
    }

    async addTopics(ctx: RequestContext, id: string, topicNames: string[]) {
        // Get the ghillie from id
        const foundGhillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!foundGhillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is a moderator or owner of the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieManage, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to add topics to this ghillie",
            );
        }

        const ghillie = await this.prisma.$transaction(async (prisma) => {
            const topics = await Promise.all(
                topicNames?.map(async (topicName) => {
                    return await prisma.topic.upsert({
                        where: {
                            name: topicName,
                        },
                        update: {},
                        create: {
                            name: topicName,
                            slug: slugify(topicName, {
                                replacement: '-',
                                lower: true,
                                strict: true,
                                trim: true,
                            }),
                            createdByUserId: ctx.user.id,
                        },
                    });
                }),
            );

            return await prisma.ghillie.update({
                where: { id: id },
                data: {
                    ...foundGhillie,
                    topics: {
                        connect: topics.map((topic) => ({
                            id: topic.id,
                        })),
                    },
                },
                include: {
                    topics: true,
                    _count: {
                        select: {
                            members: true,
                        },
                    },
                    members: {
                        where: {
                            userId: ctx.user.id,
                        },
                    },
                },
            });
        });

        return plainToInstance(GhillieDetailDto, ghillie, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async removeTopics(ctx: RequestContext, id: string, topicIds: string[]) {
        // Get the ghillie from id
        const foundGhillie = await this.prisma.ghillie.findUnique({
            where: {
                id: id,
            },
        });

        if (!foundGhillie) {
            throw new NotFoundException('Ghillie not found');
        }

        // Make sure the request user is a moderator or owner of the ghillie
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: id }],
            },
        });
        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.GhillieManage, ghillieMember);
        if (!isAllowed) {
            throw new UnauthorizedException(
                "You're not allowed to add topics to this ghillie",
            );
        }

        const ghillie = await this.prisma.ghillie.update({
            where: { id: id },
            data: {
                ...foundGhillie,
                topics: {
                    deleteMany: {
                        id: {
                            in: topicIds,
                        },
                    },
                },
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(GhillieDetailDto, ghillie, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getGhilliesForCurrentUser(
        ctx: RequestContext,
        take: number,
        cursor?: string,
    ): Promise<{
        ghillies: GhillieDetailDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(
            ctx,
            `${this.getGhilliesForCurrentUser.name} was called`,
        );

        const { findManyArgs, toConnection, toResponse } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : undefined,
        });

        try {
            // Get all ghillies the user is a member of
            const ghillies = await this.prisma.ghillie.findMany({
                ...findManyArgs,
                where: {
                    status: {
                        equals: GhillieStatus.ACTIVE,
                    },
                    members: {
                        some: {
                            userId: ctx.user.id,
                            memberStatus: MemberStatus.ACTIVE,
                        },
                    },
                },
            });

            return {
                ghillies: plainToInstance(
                    GhillieDetailDto,
                    toResponse(ghillies),
                    {
                        excludeExtraneousValues: true,
                        enableImplicitConversion: true,
                    },
                ),
                pageInfo: toConnection(ghillies).pageInfo,
            };
        } catch (error) {
            this.logger.error(ctx, error);
            throw new InternalServerErrorException();
        }
    }

    async updateGhillieLogo(
        ctx: RequestContext,
        id: string,
        file: Express.Multer.File,
    ) {
        this.logger.log(ctx, `${this.updateGhillieLogo.name} was called`);

        const ghillieMember = await this.pg.oneOrNone(
            'SELECT * FROM ghillie_members WHERE ghillie_id = $1 AND user_id = $2',
            [id, ctx.user.id],
        );

        if (!ghillieMember) {
            throw new UnauthorizedException(
                'You are not allowed to update this ghillie',
            );
        }

        const isAllowed =
            ghillieMember.role === GhillieRole.OWNER ||
            ctx.user.authorities.includes('ROLE_ADMIN');
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to update this ghillie',
            );
        }

        const ghillie = await this.pg.oneOrNone(
            `SELECT *
             FROM ghillie
             WHERE ghillie.id = $1`,
            [id],
        );

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        try {
            const publicImage =
                await this.ghillieAssetsService.createOrUpdateGhillieAsset(
                    ctx,
                    AssetTypes.IMAGE,
                    file,
                    ghillie?.publicImageId,
                );

            return await this.pg.one(
                `UPDATE ghillie
                 SET image_url       = $1,
                     public_image_id = $2
                 WHERE id = $3
                 RETURNING *`,
                [publicImage.url, publicImage.id, id],
            );
        } catch (err) {
            this.logger.error(ctx, err);
            throw new InternalServerErrorException(
                `Error updating ghillie logo: ${err}`,
            );
        }
    }

    async getCombinedGhillies(
        ctx: RequestContext,
        limit: number,
    ): Promise<CombinedGhilliesDto> {
        this.logger.log(ctx, `${this.getCombinedGhillies.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view Ghillies',
            );
        }

        // We are going to make heavy use of postgres prepared statements for performance optimization via cached execution plans
        return await this.pg
            .task('combined-ghillies-query', async (t) => {
                const users = await t.manyOrNone({
                    name: 'get-users-ghillies',
                    text: `SELECT DISTINCT *,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT DISTINCT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1
                                              AND gmu.member_status = 'ACTIVE'
                                            )                                                      AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE status = $2
                             AND id IN (SELECT ghillie_id
                                        FROM ghillie_members
                                        WHERE user_id = $3
                                          AND member_status = $4)
                           LIMIT $5 OFFSET 0`,
                    values: [
                        ctx.user.id,
                        GhillieStatus.ACTIVE,
                        ctx.user.id,
                        MemberStatus.ACTIVE,
                        limit,
                    ],
                });
                const popularByMembers = await t.manyOrNone({
                    name: 'get-popular-ghillies-by-members',
                    text: `SELECT DISTINCT g.*,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1)                                       AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE g.status = $2
                             AND g.is_private = $3
                             AND g.is_internal = false
                           ORDER BY "_totalMembers" DESC
                           LIMIT $4 OFFSET 0`,
                    values: [ctx.user.id, GhillieStatus.ACTIVE, false, limit],
                });
                const popularByTrending = await t.manyOrNone({
                    name: 'get-popular-ghillies-by-trending',
                    text: `SELECT DISTINCT g.*,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT COUNT(*)
                                            FROM post
                                            WHERE ghillie_id = g.id
                                              AND created_date > NOW() - INTERVAL '24 hours')             AS "_postCount",
                                           (SELECT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1)                                       AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN post AS p ON p.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE g.status = $2
                             AND g.is_private = $3
                           ORDER BY "_postCount" DESC
                           LIMIT $4 OFFSET 0`,
                    values: [ctx.user.id, GhillieStatus.ACTIVE, false, limit],
                });
                const newest = await t.manyOrNone({
                    name: 'get-newest-ghillies',
                    text: `SELECT DISTINCT *,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1)                                       AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE status = $2
                             AND is_private = $3
                             AND is_internal = false
                           ORDER BY created_date DESC
                           LIMIT $4 OFFSET 0`,
                    values: [ctx.user.id, GhillieStatus.ACTIVE, false, limit],
                });
                const internal = await t.manyOrNone({
                    name: 'get-internal-ghillies',
                    text: `SELECT DISTINCT *,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1)                                       AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE status = $2
                             AND is_private = $3
                             AND is_internal = true
                           LIMIT $4 OFFSET 0`,
                    values: [ctx.user.id, GhillieStatus.ACTIVE, false, 20],
                });
                const promoted = await t.manyOrNone({
                    name: 'get-promoted-ghillies',
                    text: `SELECT DISTINCT *,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1)                                       AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE status = $2
                             AND is_private = $3
                             AND is_internal = false
                             AND is_promoted = true
                           LIMIT $4 OFFSET 0`,
                    values: [ctx.user.id, GhillieStatus.ACTIVE, false, 20],
                });
                const sponsored = await t.manyOrNone({
                    name: 'get-sponsored-ghillies',
                    text: `SELECT DISTINCT *,
                                           (SELECT COUNT(*) FROM ghillie_members WHERE ghillie_id = g.id) AS "_totalMembers",
                                           (SELECT jsonb_agg(gmu)
                                            FROM ghillie_members AS gmu
                                            WHERE gmu.ghillie_id = g.id
                                              AND gmu.user_id = $1)                                       AS "_memberMeta"
                           FROM ghillie AS g
                                    LEFT JOIN ghillie_members AS gm ON gm.ghillie_id = g.id
                                    LEFT JOIN ghillie_members AS gmu
                                              ON gmu.ghillie_id = g.id AND gmu.user_id = $1 AND
                                                 gmu.member_status = 'ACTIVE'
                           WHERE status = $2
                             AND is_private = $3
                             AND is_internal = false
                             AND is_sponsored = true
                           LIMIT $4 OFFSET 0`,
                    values: [ctx.user.id, GhillieStatus.ACTIVE, false, 20],
                });

                return {
                    users,
                    popularByMembers,
                    popularByTrending,
                    newest,
                    internal,
                    promoted,
                    sponsored,
                };
            })
            .then((data) => {
                return plainToClass(CombinedGhilliesDto, data, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                });
            });
    }

    async getPopularGhilliesByMembers(
        ctx: RequestContext,
        limit: number,
    ): Promise<GhillieDetailDto[]> {
        this.logger.log(
            ctx,
            `${this.getPopularGhilliesByMembers.name} was called`,
        );

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view Ghillies',
            );
        }

        const ghillies = await this.prisma.ghillie.findMany({
            where: {
                status: GhillieStatus.ACTIVE,
                isPrivate: false,
            },
            skip: 0,
            take: 10,
            orderBy: {
                members: {
                    _count: 'desc',
                },
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(GhillieDetailDto, ghillies, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getPopularGhilliesByTrendingPosts(
        ctx: RequestContext,
        limit: number,
    ) {
        this.logger.log(
            ctx,
            `${this.getPopularGhilliesByTrendingPosts.name} was called`,
        );

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view Ghillies',
            );
        }

        const ghillies = await this.prisma.ghillie.findMany({
            where: {
                status: GhillieStatus.ACTIVE,
                isPrivate: false,
            },
            skip: 0,
            take: 10,
            orderBy: {
                posts: {
                    _count: 'desc',
                },
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(GhillieDetailDto, ghillies, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getNewestGhillies(ctx: RequestContext, limit: number) {
        this.logger.log(ctx, `${this.getNewestGhillies.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.ghillieAclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view Ghillies',
            );
        }

        const ghillies = await this.prisma.ghillie.findMany({
            where: {
                status: GhillieStatus.ACTIVE,
                isPrivate: false,
            },
            skip: 0,
            take: 10,
            orderBy: {
                createdDate: 'desc',
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(GhillieDetailDto, ghillies, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async generateInviteCode(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.generateInviteCode.name} was called`);

        const ghillieMember = await this.pg.oneOrNone(
            'SELECT * FROM ghillie_members WHERE ghillie_id = $1 AND user_id = $2',
            [id, ctx.user.id],
        );

        if (!ghillieMember) {
            throw new UnauthorizedException(
                'You are not allowed to update this ghillie',
            );
        }

        const isAllowed =
            ghillieMember.role === GhillieRole.OWNER ||
            ctx.user.authorities.includes('ROLE_ADMIN');
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to update this ghillie',
            );
        }

        const ghillie = await this.pg.oneOrNone(
            `SELECT *
             FROM ghillie
             WHERE ghillie.id = $1`,
            [id],
        );

        if (!ghillie) {
            throw new NotFoundException('Ghillie not found');
        }

        if (ghillie.inviteCode) {
            return plainToInstance(GhillieDetailDto, ghillie, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });
        }

        const generatedCode = await this.generateRandomInviteCode();

        const updatedGhillie = await this.prisma.ghillie.update({
            where: { id: id },
            data: {
                inviteCode: generatedCode,
            },
            include: {
                topics: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
                members: {
                    where: {
                        userId: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(GhillieDetailDto, updatedGhillie, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    // generate a unique 6 character/digit invite code, this should not have to call the database
    // to check for uniqueness, but it does for now
    private async generateRandomInviteCode(): Promise<string> {
        // Use the JavaScript Date object to generate a unique seed
        // for the random number generator
        let seed = new Date().getTime();

        // Use the seed to initialize the Math.random function
        Math.random = function () {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        // Use Math.random to generate a random 6 character string
        let str = '';
        for (let i = 0; i < 6; i++) {
            // Generate a random number between 0 and 61
            const num = Math.floor(Math.random() * 62);

            // Convert the number to a character, using the following mapping:
            // 0-9: '0'-'9'
            // 10-35: 'A'-'Z'
            // 36-61: 'a'-'z'
            if (num < 10) {
                str += String.fromCharCode(num + 48);
            } else if (num < 36) {
                str += String.fromCharCode(num + 55);
            } else {
                str += String.fromCharCode(num + 61);
            }
        }

        // check if the invite code is unique
        const foundGhillie = this.pg.oneOrNone(
            `SELECT *
             FROM ghillie
             WHERE invite_code = $1`,
            [str],
        );

        if (foundGhillie) {
            // if not unique, try again
            return this.generateRandomInviteCode();
        }

        // if unique, return the invite code
        return str;
    }
}
