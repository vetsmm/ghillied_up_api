import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AppLogger } from '../../shared';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { GhillieAssetsService } from '../../files/services/ghillie-assets.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import slugify from 'slugify';
import { AssetTypes } from '../../files/dtos/asset.types';
import {
    DEFAULT_GHILLIES,
    DefaultGhillieType,
} from '../../assets/base-ghillies/default-ghillies';
import * as cuid from 'cuid';
import * as path from 'path';
import * as fs from 'fs';
import { User, UserAuthority } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GhillieStartupService implements OnApplicationBootstrap {
    defaultGhillies = [];

    constructor(
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
        private readonly ghillieAssetService: GhillieAssetsService,
        private readonly prisma: PrismaService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(GhillieStartupService.name);
    }

    async onApplicationBootstrap() {
        await this.loadInitialGhillies();
    }

    private async loadInitialGhillies() {
        this.logger.log(null, 'Loading initial ghillies');

        // loop over the ServiceBranch enum
        for (const defaultGhillie of DEFAULT_GHILLIES) {
            const ghillie = await this.pg.oneOrNone(
                'SELECT * FROM ghillie WHERE name = $1',
                defaultGhillie.name,
            );
            if (!ghillie) {
                // if not, create it
                await this.createGhillie(defaultGhillie);
            }
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
            return await this.pg.one(
                `INSERT INTO "user" (id, username, slug, "password", email, authorities, created_date, updated_date,
                                     activated)
                 VALUES ($1, $2, $3, $4, $5, $6::json[], NOW(), NOW())
                 RETURNING *`,
                [
                    cuid(),
                    'admin',
                    'admin',
                    'admin',
                    'admin@ghilliedup.com',
                    [UserAuthority.ROLE_USER, UserAuthority.ROLE_ADMIN],
                    new Date(),
                    new Date(),
                    false,
                ],
            );
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
            };

            await this.pg.none(
                `INSERT INTO ghillie (id, "name", slug, about, created_by_user_id, "read_only", created_date,
                                      updated_date, public_image_id, image_url)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, $8)`,
                [
                    cuid(),
                    ghillieData.name,
                    ghillieData.slug,
                    ghillieData.about,
                    ghillieData.createdByUserId,
                    ghillieData.readOnly,
                    ghillieData.publicImageId,
                    ghillieData.imageUrl,
                ],
            );

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
