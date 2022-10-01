import { ServiceBranch, ServiceStatus, UserAuthority } from '@prisma/client';
import { Expose } from 'class-transformer';

export class StreamUserDto {
    @Expose()
    id: string;
    @Expose()
    username: string;
    @Expose()
    branch: ServiceBranch;
    @Expose()
    serviceStatus: ServiceStatus;
    @Expose()
    slug: string;
    @Expose()
    isVerifiedMilitary: boolean;
    @Expose()
    serviceEntryDate?: Date;
    @Expose()
    serviceEndDate?: Date;
    @Expose()
    imageUrl?: string;
    @Expose()
    authorities: UserAuthority[];
}
