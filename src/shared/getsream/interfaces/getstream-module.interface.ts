import { ClientOptions } from 'getstream';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface GetStreamOptions {
  isGlobal?: boolean;
  apiKey: string;
  apiSecret: string;
  appId: string;
  clientOptions?: ClientOptions;
}

export interface GetStreamOptionsFactory {
  createGetStreamOptions(): Promise<GetStreamOptions> | GetStreamOptions;
}

export interface GetStreamAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GetStreamOptionsFactory>;
  useClass?: Type<GetStreamOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<GetStreamOptions> | GetStreamOptions;
  inject?: any[];
  isGlobal?: boolean;
}
