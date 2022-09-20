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
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    AppLogger,
    BaseApiErrorResponse,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
} from '../../shared';
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard';
import {AuthoritiesGuard} from '../../auth/guards/authorities.guard';
import {Authorities} from '../../auth/decorators/authority.decorator';
import {UserAuthority} from '@prisma/client';
import {NotificationDto} from "../dtos/notification.dto";
import {NotificationInputDto} from "../dtos/notification-input.dto";
import {NotificationService} from "../services/notification.service";
import {ReadNotificationsInputDto} from "../dtos/read-notifications-input.dto";

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly logger: AppLogger,
        private readonly notificationService: NotificationService,
    ) {
        this.logger.setContext(NotificationController.name);
    }

    // create post
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
    @ApiOperation({
        summary: 'Retrieves all of the users current notifications',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([NotificationDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER)
    async getNotifications(
        @ReqContext() ctx: RequestContext,
        @Body() body: NotificationInputDto,
    ) {
        const {notifications, pageInfo} = await this.notificationService.getNotifications(ctx, body);
        return {
            data: notifications,
            meta: pageInfo,
        };
    }

    // create post
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post("mark-as-read")
    @ApiOperation({
        summary: 'Marks a list of notifications as read',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER)
    async markNotificationAsRead(
        @ReqContext() ctx: RequestContext,
        @Body() body: ReadNotificationsInputDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.markNotificationAsRead.name} was called`);

        await this.notificationService.markNotificationAsRead(ctx, body.notificationIds);
    }
}
