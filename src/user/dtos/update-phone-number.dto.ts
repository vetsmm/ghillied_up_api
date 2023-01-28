import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_INVALID_PHONE_NUMBER } from '../../shared';

export class UpdatePhoneNumberDto {
    @ApiProperty()
    @IsString()
    @Matches(/^\+[1-9]\d{1,14}$/, { message: USER_INVALID_PHONE_NUMBER })
    phoneNumber: string;
}
