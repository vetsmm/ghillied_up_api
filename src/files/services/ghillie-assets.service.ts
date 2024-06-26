import { Inject, Injectable } from '@nestjs/common';
import { PublicFile } from '@prisma/client';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { AppLogger, RequestContext } from '../../shared';
import { AssetTypes } from '../dtos/asset.types';
import { BaseS3Service } from './base-s3.service';
import { ConfigService } from '@nestjs/config';
import cuid from 'cuid';

@Injectable()
export class GhillieAssetsService extends BaseS3Service {
    constructor(
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
    ) {
        super(configService);
        this.logger.setContext(GhillieAssetsService.name);
    }

    async getGhillieAssetById(
        ctx: RequestContext,
        publicFileId: string,
    ): Promise<PublicFile> {
        this.logger.log(ctx, `${this.getGhillieAssetById.name} was called`);
        return this.pg.oneOrNone('SELECT * FROM public_file WHERE id = $1', [
            publicFileId,
        ]);
    }

    async deleteGhillieAssetById(
        ctx: RequestContext,
        publicFile: PublicFile,
    ): Promise<void> {
        this.logger.log(ctx, `${this.deleteGhillieAssetById.name} was called`);

        if (!publicFile) {
            this.logger.error(
                ctx,
                `No public file found with id: ${publicFile.id}`,
            );
            return;
        }

        try {
            await this.pg.none('DELETE FROM public_file WHERE id = $1', [
                publicFile.id,
            ]);
            await this.deleteFile(ctx, publicFile.key);
        } catch (err) {
            this.logger.error(ctx, `Error Deleting Ghillie Image: ${err}`);
        }
    }

    async createOrUpdateGhillieAsset(
        ctx: RequestContext,
        assetType: AssetTypes,
        file: Express.Multer.File,
        publicFileId?: string,
    ): Promise<PublicFile> {
        this.logger.log(
            ctx,
            `${this.createOrUpdateGhillieAsset.name} was called`,
        );

        const filePath = `ghillies/${assetType}`;

        let response;
        try {
            response = await this.uploadFile(ctx, file, filePath);
        } catch (error) {
            this.logger.error(ctx, `Error Uploading Ghillie Image: ${error}`);
            throw error;
        }

        const { key, url } = response;
        try {
            // These can be done async
            this.pg
                .none('DELETE FROM public_file WHERE id = $1', [publicFileId])
                .catch((err) => {
                    this.logger.error(
                        ctx,
                        `Error Deleting Ghillie Image From Database: ${err}`,
                    );
                });
            this.deleteFile(ctx, publicFileId).catch((err) =>
                this.logger.error(ctx, `Error Deleting Ghillie Image: ${err}`),
            );
        } catch (err) {
            this.logger.warn(ctx, `Error Deleting Old Ghillie Image: ${err}`);
        }

        try {
            // Create the new public file
            return await this.pg.one(
                'INSERT INTO public_file (id, url, key, created_date, updated_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [cuid(), url, key, new Date(), new Date()],
            );
        } catch (error) {
            this.logger.error(ctx, `Error Uploading Ghillie Image: ${error}`);

            // perform async
            this.deleteFile(ctx, key).catch((err) => {
                this.logger.error(
                    ctx,
                    `Error Deleting New Ghillie Image: ${err}`,
                );
            });
            throw error;
        }
    }
}
