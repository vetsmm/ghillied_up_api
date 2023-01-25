import { MfaMethod } from '@prisma/client';

export interface MfaTokenPayload {
    id: string;
    type: MfaMethod;
}
