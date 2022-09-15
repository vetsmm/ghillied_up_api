import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {PhonePlatform, ServiceBranch} from "@prisma/client";

export class DeviceTokenInputDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    deviceToken: string;

    @ApiProperty()
    @IsEnum(PhonePlatform, {
        message:
            'Phone Platform must be one of the following: ' +
            Object.values(PhonePlatform)
                .map((platform) => platform.toString())
                .join(', '),
    })
    phonePlatform: PhonePlatform;
}
