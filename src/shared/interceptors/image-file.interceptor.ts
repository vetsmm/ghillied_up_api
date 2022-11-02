import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileInterceptor } from '@nestjs/platform-express';

interface ImageFilesInterceptorOptions {
    fieldName: string;
}

function ImageFilesInterceptor(
    options: ImageFilesInterceptorOptions,
): Type<NestInterceptor> {
    @Injectable()
    class Interceptor implements NestInterceptor {
        fileInterceptor: NestInterceptor;

        constructor(configService: ConfigService) {
            const maxFileSize = configService.get('files.images.maxSize');
            const allowedMimeTypes = configService.get(
                'files.images.allowedMimeTypes',
            );

            const multerOptions: MulterOptions = {
                fileFilter: (req, file, cb) => {
                    if (!allowedMimeTypes.includes(file.mimetype)) {
                        return cb(
                            new Error(
                                `Only ${allowedMimeTypes.join(
                                    ', ',
                                )} files are allowed!`,
                            ),
                            false,
                        );
                    }
                    cb(null, true);
                },
                limits: {
                    fileSize: maxFileSize,
                },
            };

            this.fileInterceptor = new (FileInterceptor(
                options.fieldName,
                multerOptions,
            ))();


        }

        intercept(...args: Parameters<NestInterceptor['intercept']>) {
            return this.fileInterceptor.intercept(...args);
        }
    }

    return mixin(Interceptor);
}

export default ImageFilesInterceptor;
