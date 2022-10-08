import { ServiceBranch, ServiceStatus } from '@prisma/client';

export interface SocialInterface {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    groupAffiliation?: GroupAffiliation;
    serviceStatus?: ServiceStatus;
    serviceBranch?: ServiceBranch;
    isVerifiedMilitary?: boolean;
}

export enum GroupAffiliation {
    MILITARY = 'military',
}

export enum SubGroupAffiliation {
    VETERAN = 'Veteran',
    ACTIVE_DUTY = 'Active Duty',
}
