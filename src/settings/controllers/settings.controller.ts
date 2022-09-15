import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    AppLogger,
    BaseApiErrorResponse,
    BaseApiResponse,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse
} from "../../shared";
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {DeviceTokenInputDto} from "../dtos/device-token-input.dto";
import {SettingsService} from "../services/settings.service";

@ApiTags('User Settings')
@Controller('settings')
export class SettingsController {
    constructor(
        private readonly settingsService: SettingsService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(SettingsController.name);
    }

    @UseGuards(JwtAuthGuard)
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
        }
    }
}
