import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { UserController } from './controllers/user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../shared';
import { UserAclService } from './services/user-acl.service';
import { AnonymousUserController } from './controllers/anonymous-user.controller';

@Module({
  providers: [
    UserService,
    JwtAuthStrategy,
    PrismaService,
    AppLogger,
    ConfigService,
    UserAclService,
  ],
  controllers: [UserController, AnonymousUserController],
  exports: [UserService],
})
export class UserModule {}
