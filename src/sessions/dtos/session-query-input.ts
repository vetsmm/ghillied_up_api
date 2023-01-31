import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class SessionQueryInput {
    @ApiProperty()
    @IsOptional()
    cursor?: Prisma.SessionWhereUniqueInput;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    skip?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    take?: number;

    @ApiProperty()
    @IsOptional()
    where?: Prisma.SessionWhereUniqueInput;

    @ApiProperty()
    @IsOptional()
    orderBy?: Record<string, 'asc' | 'desc'>;
}
