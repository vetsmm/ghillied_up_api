import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Post,
    Put,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    AppLogger,
    BaseApiErrorResponse,
    BaseApiResponse,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
} from '../../shared';
import { DeviceTokenInputDto } from '../dtos/device-token-input.dto';
import { SettingsService } from '../services/settings.service';
import { UserPushNotificationSettingsDto } from '../dtos/settings/user-push-notification-settings.dto';
import { UserPushNotificationsInputDto } from '../dtos/settings/user-push-notifications-input.dto';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('User Settings')
@Controller('settings')
export class SettingsController {
    constructor(
        private readonly settingsService: SettingsService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(SettingsController.name);
    }

    @UseGuards(ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('device-token')
    @ApiOperation({
        summary: 'Adds a new user device token',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(BaseApiResponse),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    async addDeviceToken(
        @ReqContext() ctx: RequestContext,
        @Body() input: DeviceTokenInputDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(ctx, `${this.addDeviceToken.name} was called`);
        await this.settingsService.createDeviceToken(ctx, input);

        return {
            data: 'Device token added',
            meta: {},
        };
    }

    @UseGuards(ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('push-notifications')
    @ApiOperation({
        summary: "Get the current user's push notifications settings",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(UserPushNotificationSettingsDto),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    async getPushNotificationSettings(
        @ReqContext() ctx: RequestContext,
    ): Promise<BaseApiResponse<UserPushNotificationSettingsDto>> {
        this.logger.log(
            ctx,
            `${this.getPushNotificationSettings.name} was called`,
        );
        const settings = await this.settingsService.getPushNotificationSettings(
            ctx,
        );
        return {
            data: settings,
            meta: {},
        };
    }

    // Update settings for current user
    @UseGuards(ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put('push-notifications')
    @ApiOperation({
        summary: "Update the current user's push notifications settings",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(UserPushNotificationSettingsDto),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    async updatePushNotificationSettings(
        @ReqContext() ctx: RequestContext,
        @Body() inputDto: UserPushNotificationsInputDto,
    ): Promise<BaseApiResponse<UserPushNotificationSettingsDto>> {
        this.logger.log(
            ctx,
            `${this.updatePushNotificationSettings.name} was called`,
        );
        const settings =
            await this.settingsService.updatePushNotificationSettings(
                ctx,
                inputDto,
            );

        return {
            data: settings,
            meta: {},
        };
    }
}
