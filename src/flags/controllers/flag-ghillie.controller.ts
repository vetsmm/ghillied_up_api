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
  HttpException,
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
  FlagGhillieInputDto,
} from '../../shared';
import { FlagGhillieService } from '../services/flag-ghillie.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('Flag Ghillie')
@Controller('flags/ghillie')
export class FlagGhillieController {
  constructor(
    private readonly logger: AppLogger,
    private readonly flagGhillieService: FlagGhillieService,
  ) {
    this.logger.setContext(FlagGhillieController.name);
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Creates a new flag for a ghillie',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
  async flagGhillie(
    @ReqContext() ctx: RequestContext,
    @Body() input: FlagGhillieInputDto,
  ): Promise<void> {
    this.logger.log(ctx, `${this.flagGhillie.name} was called`);

    try {
      await this.flagGhillieService.flagGhillie(ctx, input);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
