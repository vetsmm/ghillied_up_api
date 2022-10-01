import { DynamicModule, Module, Provider } from '@nestjs/common';
import * as optionTypes from './interfaces';

import { GetStreamService } from './getstream.service';
import { GET_STREAM_OPTIONS } from './getstream.constants';

@Module({})
export class GetStreamModule {
    static register(options: optionTypes.GetStreamOptions): DynamicModule {
        const { isGlobal, ...getStreamOptions } = options;
        return {
            module: GetStreamModule,
            providers: [
                {
                    provide: GET_STREAM_OPTIONS,
                    useValue: getStreamOptions,
                },
                GetStreamService,
            ],
            exports: [GetStreamService],
            global: isGlobal,
        };
    }

    static registerAsync(
        options: optionTypes.GetStreamAsyncOptions,
    ): DynamicModule {
        const { isGlobal, ...getStreamOptions } = options;
        const asyncOpts = this.createAsyncProviders(getStreamOptions);
        return {
            module: GetStreamModule,
            imports: options.imports,
            providers: [GetStreamService, ...asyncOpts],
            exports: [GetStreamService],
            global: isGlobal,
        };
    }

    private static createAsyncProviders(
        options: optionTypes.GetStreamAsyncOptions,
    ): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }

    private static createAsyncOptionsProvider(
        options: optionTypes.GetStreamAsyncOptions,
    ): Provider {
        if (options.useFactory) {
            return {
                provide: GET_STREAM_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: GET_STREAM_OPTIONS,
            useFactory: async (
                optionsFactory: optionTypes.GetStreamOptionsFactory,
            ) => await optionsFactory.createGetStreamOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
}
