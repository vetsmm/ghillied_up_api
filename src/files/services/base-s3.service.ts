import { S3 } from 'aws-sdk';
import { RequestContext } from '../../shared';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { MemoryStoredFile } from 'nestjs-form-data';

export abstract class BaseS3Service {
    protected constructor(private readonly config: ConfigService) {}

    /**
     * Uploads a file to S3
     * @param ctx RequestContext
     * @param file The file to upload
     * @param filePath The path to upload the file to
     * @returns Promise<{ key: string; url: string }>
     *     Resolves with the key and url of the uploaded file
     *     Throws an error if the file was not uploaded
     */
    protected async uploadFile(
        ctx: RequestContext,
        file: MemoryStoredFile,
        filePath: string,
    ): Promise<{
        key: string;
        url: string;
    }> {
        const { originalName, buffer } = file;

        const s3 = new S3();
        const key = `${filePath}/${uuidv4()}-${originalName}`;
        const params = {
            Bucket: this.config.get('aws.publicBucketName'),
            Key: key,
            Body: buffer,
        };
        const s3Response: ManagedUpload.SendData = await s3
            .upload(params)
            .promise();
        return {
            key: s3Response.Key,
            url: s3Response.Location,
        };
    }

    /**
     * Deletes a file from S3
     * @param ctx RequestContext
     * @param key The key of the file to delete
     * @returns Promise<void>
     *     Resolves if the file was deleted
     *     Throws an error if the file was not deleted
     */
    protected async deleteFile(
        ctx: RequestContext,
        key: string,
    ): Promise<void> {
        const s3 = new S3();
        const params = {
            Bucket: this.config.get('aws.publicBucketName'),
            Key: key,
        };
        await s3.deleteObject(params).promise();
    }

    /**
     * Gets a file from S3
     * @param ctx RequestContext
     * @param key The key of the file to get
     * @returns Promise<Buffer>
     *     Resolves with the file as a buffer
     *     Throws an error if the file was not retrieved
     */
    protected async getFile(ctx: RequestContext, key: string): Promise<Buffer> {
        const s3 = new S3();
        const params = {
            Bucket: this.config.get('aws.publicBucketName'),
            Key: key,
        };
        const s3Response = await s3.getObject(params).promise();
        return s3Response.Body as Buffer;
    }

    private checkFileTypes(
        file: Express.Multer.File,
        allowedFileTypes: string[],
    ): boolean {
        const { mimetype } = file;
        return allowedFileTypes.includes(mimetype);
    }

    private checkFileSize(
        file: Express.Multer.File,
        maxFileSize: number,
    ): boolean {
        const { size } = file;
        return size <= maxFileSize;
    }
}
