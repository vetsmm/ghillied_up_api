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
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthIdMeService } from '../services/id-me.service';
import {
    BaseApiErrorResponse,
    BaseApiResponse,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
} from '../../shared';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthIdMeVerifyDto } from '../dtos/auth-id-me-verify.dto';
import { AuthIdMeVerifyResultDto } from '../dtos/auth-id-me-verify-result.dto';
import { UserService } from '../../user/services/user.service';

@ApiTags('Auth')
@Controller({
    path: 'auth/idme',
    version: '1',
})
export class AuthIdMeController {
    constructor(
        public userService: UserService,
        public authIdMeService: AuthIdMeService,
    ) {}

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({
        summary: 'Verify military status of a user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(AuthIdMeVerifyResultDto),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    async verifyMilitaryStatus(
        @ReqContext() ctx: RequestContext,
        @Body() accessToken: AuthIdMeVerifyDto,
    ): Promise<BaseApiResponse<AuthIdMeVerifyResultDto>> {
        try {
            const socialData = await this.authIdMeService.getProfileByToken(
                ctx,
                accessToken.accessToken,
            );

            if (!socialData.isVerifiedMilitary) {
                return {
                    data: {
                        status: 'ERROR',
                        message:
                            'User is not a verified veteran or military of the member',
                    },
                    meta: {},
                };
            }

            await this.userService.addMilitaryVerification(ctx, socialData);

            return {
                data: {
                    status: 'SUCCESS',
                    message: 'Military status verified',
                },
                meta: {},
            };
        } catch (error) {
            return {
                data: {
                    status: 'ERROR',
                    message: error.message,
                },
                meta: {},
            };
        }
    }
}
