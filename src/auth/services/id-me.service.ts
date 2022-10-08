import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppLogger, RequestContext } from '../../shared';
import {
    Attribute,
    AuthIdMeUserDetailsDto,
    Status,
} from '../dtos/auth-id-me-user-details.dto';
import { ServiceStatus } from '@prisma/client';
import { SocialInterface } from '../interfaces/social.interface';

@Injectable()
export class AuthIdMeService {
    constructor(
        private readonly logger: AppLogger,
        private configService: ConfigService,
        private httpService: HttpService,
    ) {}

    async getProfileByToken(
        ctx: RequestContext,
        accessToken: string,
    ): Promise<SocialInterface> {
        this.logger.log(ctx, `${this.getProfileByToken.name} was called`);

        const data: AuthIdMeUserDetailsDto = await lastValueFrom(
            // Add bearer header

            this.httpService
                .get(`https://api.id.me/api/public/v3/attributes.json`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                .pipe(map((resp) => resp.data)),
        );

        // Create object and check if user is veteran or ad if not throw exception
        const userDeetz = {} as SocialInterface;
        data.attributes.forEach((attribute: Attribute) => {
            switch (attribute.handle) {
                case 'email':
                    userDeetz.email = attribute.value;
                    break;
                case 'fname':
                    userDeetz.firstName = attribute.value;
                    break;
                case 'lname':
                    userDeetz.lastName = attribute.value;
                    break;
                case 'uuid':
                    userDeetz.id = attribute.value;
                    break;
            }
        });
        // Find the status with a group = military
        const status: Status = data.status.find(
            (status: Status) => status.group.toUpperCase() === 'MILITARY',
        );
        // If the status is not found, throw an exception
        if (!status) {
            this.logger.warn(
                ctx,
                'User does not belong to the military group in ID.me',
            );
            throw new Error(
                'User is not a verified veteran or military of the member',
            );
        }

        // Convert all subgroups to uppercase to make case insensitive
        const upperCaseSubGroups = status.subgroups.map((subgroup: string) =>
            subgroup.toUpperCase(),
        );

        if (
            upperCaseSubGroups.includes('VETERAN') ||
            upperCaseSubGroups.includes('RETIREE')
        ) {
            userDeetz.serviceStatus = ServiceStatus.VETERAN;
        } else if (upperCaseSubGroups.includes('SERVICE MEMBER')) {
            userDeetz.serviceStatus = ServiceStatus.ACTIVE_DUTY;
        } else {
            this.logger.warn(
                ctx,
                `User does not belong to the appropriate subgroup in ID.me, groups: ${upperCaseSubGroups}`,
            );
            throw new Error(
                'User is not a verified veteran or military of the member',
            );
        }

        userDeetz.isVerifiedMilitary = true;

        return userDeetz;
    }
}
