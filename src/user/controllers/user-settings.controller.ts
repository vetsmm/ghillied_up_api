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
  Put,
  UseInterceptors,
} from '@nestjs/common';
import {
  AppLogger,
  BaseApiErrorResponse,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from '../../shared';
import { UserPushNotificationSettingsDto } from '../dtos/settings/user-push-notification-settings.dto';
import { UserSettingsService } from '../services/user-settings.service';
import { UserPushNotificationsInputDto } from '../dtos/settings/user-push-notifications-input.dto';

@ApiTags('User Settings')
@Controller('user-settings')
export class UserSettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserSettingsController.name);
  }

  // Get settings for current user
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
  ): Promise<UserPushNotificationSettingsDto> {
    this.logger.log(ctx, `${this.getPushNotificationSettings.name} was called`);
    return this.userSettingsService.getPushNotificationSettings(ctx);
  }

  // Update settings for current user
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
  ): Promise<UserPushNotificationSettingsDto> {
    this.logger.log(
      ctx,
      `${this.updatePushNotificationSettings.name} was called`,
    );
    return this.userSettingsService.updatePushNotificationSettings(
      ctx,
      inputDto,
    );
  }
}
