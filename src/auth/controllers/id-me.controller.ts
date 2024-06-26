import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthIdMeService } from '../services/id-me.service';
import {
    BaseApiResponse,
    RateLimit,
    ReqContext,
    RequestContext,
} from '../../shared';
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
    @RateLimit(5)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({
        summary: 'Verify military status of a user',
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
