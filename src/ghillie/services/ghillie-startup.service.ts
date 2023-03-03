import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AppLogger } from '../../shared';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { GhillieAssetsService } from '../../files/services/ghillie-assets.service';
import slugify from 'slugify';
import { AssetTypes } from '../../files/dtos/asset.types';
import {
    DEFAULT_GHILLIES,
    DefaultGhillieType,
} from '../../assets/base-ghillies/default-ghillies';
import * as path from 'path';
import * as fs from 'fs';
import { User, UserAuthority } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GhillieStartupService implements OnApplicationBootstrap {
    constructor(
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
        private readonly ghillieAssetService: GhillieAssetsService,
        private readonly prisma: PrismaService,
    ) {
        this.logger.setContext(GhillieStartupService.name);
    }

    async onApplicationBootstrap() {
        await this.loadInitialGhillies();
    }

    private async loadInitialGhillies() {
        let ghillieCreated = false;
        // loop over the ServiceBranch enum
        for (const defaultGhillie of DEFAULT_GHILLIES) {
            const ghillie = await this.prisma.ghillie.findFirst({
                where: {
                    name: defaultGhillie.name,
                },
            });
            if (!ghillie) {
                // if not, create it
                await this.createGhillie(defaultGhillie);
                ghillieCreated = true;
            }
        }

        if (ghillieCreated) {
            this.logger.log(null, 'Created default ghillies');
        }
    }

    private async getAdminUser() {
        // get the first admin user or none
        const maybeUser = await this.prisma.user.findFirst({
            where: {
                authorities: {
                    has: UserAuthority.ROLE_ADMIN,
                },
            },
        });

        if (!maybeUser) {
            // Create a default admin user
            return await this.prisma.user.create({
                data: {
                    username: 'admin',
                    slug: 'admin',
                    password: 'admin',
                    email: 'admin@ghilliedup.com',
                    authorities: [
                        UserAuthority.ROLE_USER,
                        UserAuthority.ROLE_ADMIN,
                    ],
                    createdDate: new Date(),
                    updatedDate: new Date(),
                    activated: false,
                },
            });
        }

        return maybeUser;
    }

    private async createGhillie(defaultGhillie: DefaultGhillieType) {
        try {
            const adminUser: User = await this.getAdminUser();

            const file = this.getServiceImage(defaultGhillie.image);

            const publicImage =
                await this.ghillieAssetService.createOrUpdateGhillieAsset(
                    null,
                    AssetTypes.IMAGE,
                    file,
                    undefined,
                );

            const ghillieData = {
                name: defaultGhillie.name,
                slug: slugify(defaultGhillie.name, {
                    replacement: '-',
                    lower: true,
                    strict: true,
                    trim: true,
                }),
                about: defaultGhillie.description,
                createdByUserId: adminUser.id,
                readOnly: false,
                publicImageId: publicImage.id,
                imageUrl: publicImage.url,
                isInternal: true,
            };

            await this.prisma.ghillie.create({
                data: {
                    name: ghillieData.name,
                    slug: ghillieData.slug,
                    about: ghillieData.about,
                    createdByUserId: ghillieData.createdByUserId,
                    readOnly: ghillieData.readOnly,
                    publicImageId: ghillieData.publicImageId,
                    imageUrl: ghillieData.imageUrl,
                    isInternal: ghillieData.isInternal,
                },
            });

            this.logger.log(null, `Created ghillie: ${ghillieData.name}`);
        } catch (error) {
            this.logger.error(null, `Failed to create ghillie: ${error}`);
        }
    }

    private getServiceImage(imageName: string): Express.Multer.File {
        // Create in the image from the assets folder
        const image = fs.readFileSync(
            path.join(__dirname, `../../assets/base-ghillies/${imageName}`),
        );

        // Create a file object
        return {
            buffer: image,
            originalname: imageName,
            mimetype: 'image/png',
            size: image.length,
        } as Express.Multer.File;
    }

    private toUpperSentenceCase(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}
