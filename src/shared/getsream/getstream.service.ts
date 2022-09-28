import { Inject, Injectable } from '@nestjs/common';
import * as Stream from 'getstream';
import { GET_STREAM_OPTIONS } from './getstream.constants';
import { GetStreamOptions } from './interfaces/getstream-module.interface';

@Injectable()
export class GetStreamService {
  public postStreamClient: Stream.StreamClient;

  constructor(
    @Inject(GET_STREAM_OPTIONS) private _GetStreamOptions: GetStreamOptions,
  ) {
    this.postStreamClient = Stream.connect(
      this._GetStreamOptions.apiKey,
      this._GetStreamOptions.apiSecret,
      this._GetStreamOptions.appId,
      this._GetStreamOptions.clientOptions,
    );
  }
}
