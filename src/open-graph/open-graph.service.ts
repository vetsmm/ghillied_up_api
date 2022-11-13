import { Injectable } from '@nestjs/common';
import { AppLogger, RequestContext } from '../shared';
import { LinkMeta } from './dtos/link-meta';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OpenGraphService {
    constructor(
        private readonly logger: AppLogger,
        private readonly httpService: HttpService,
    ) {
        this.logger.setContext(OpenGraphService.name);
    }

    private readonly scraper = require('metascraper')([
        require('metascraper-author')(),
        require('metascraper-date')(),
        require('metascraper-description')(),
        require('metascraper-image')(),
        require('metascraper-logo')(),
        require('metascraper-clearbit')(),
        require('metascraper-publisher')(),
        require('metascraper-title')(),
        require('metascraper-url')(),
        require('metascraper-instagram')(),
        require('metascraper-youtube')(),
        require('metascraper-manifest')(),
        require('metascraper-media-provider')(),
        require('metascraper-video')(),
    ]);

    private parseUrlFromText(text: string): string | undefined {
        const urlRegex =
            /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        const url = text.match(urlRegex);
        return url ? url[0] : undefined;
    }

    private getType(response: LinkMeta): string {
        if (response.video) {
            return 'video';
        }
        if (response.image) {
            return 'image';
        }
        return 'link';
    }

    cleanPublisher(linkMeta: LinkMeta): LinkMeta {
        switch (linkMeta.publisher) {
            case 'Twitter':
                return undefined;
            default:
                return linkMeta;
        }
    }

    cleanPublisherUrl(url?: string): string {
        if (!url) {
            return undefined;
        }
        // If Twitter, make sure the url follows the format https://twitter.com/username/status/1234567890
        if (url.includes('twitter.com') || url.includes('t.co')) {
            const splitUrl = url.split('/');
            const username = splitUrl[3];
            const status = splitUrl[5];
            return `https://twitter.com/${username}/status/${status}`;
        }

        return url;
    }

    async getOpenGraphData(
        ctx: RequestContext,
        text: string,
    ): Promise<LinkMeta | undefined> {
        this.logger.debug(ctx, `${this.getOpenGraphData.name} was called`);

        let url = this.parseUrlFromText(text);
        url = this.cleanPublisherUrl(url);
        if (!url) {
            this.logger.debug(
                ctx,
                `${this.getOpenGraphData.name} no url found`,
            );
            return undefined;
        }

        try {
            const data = await lastValueFrom(
                this.httpService.get(url).pipe(map((resp) => resp.data)),
            );

            if (!data) {
                return undefined;
            }

            const response: LinkMeta = await this.scraper({ html: data, url });
            response.type = this.getType(response);
            return this.cleanPublisher(response);
        } catch (error) {
            this.logger.error(
                ctx,
                `${this.getOpenGraphData.name} failed`,
                error,
            );
            return undefined;
        }
    }
}
