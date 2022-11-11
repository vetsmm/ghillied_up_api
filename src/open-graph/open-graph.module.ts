import { AppLogger } from '../shared';
import { OpenGraphService } from './open-graph.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule.register({ timeout: 5000 })],
    providers: [AppLogger, OpenGraphService],
    exports: [OpenGraphService],
})
export class OpenGraphModule {}
