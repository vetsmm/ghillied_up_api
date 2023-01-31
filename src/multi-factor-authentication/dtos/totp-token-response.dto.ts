import { MfaMethod } from '@prisma/client';

export interface TotpTokenResponse {
    totpToken: string;
    type: MfaMethod;
    multiFactorRequired: true;
}
